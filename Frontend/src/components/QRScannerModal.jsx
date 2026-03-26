import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

const QRScannerModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState(null);
  useEffect(() => {
    let html5QrcodeScanner = null;
    let isNavigating = false;

    if (open) {
      setScanError(null);
      isNavigating = false;
      
      const timer = setTimeout(() => {
        html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            if (isNavigating) return; // Prevent multiple scans
            console.log("QR Code Scanned:", decodedText);

            try {
              const url = new URL(decodedText);
              const path = url.pathname;
              
              if (path.startsWith('/edit/') || path.startsWith('/device/service/')) {
                 isNavigating = true;
                 
                 // Instead of clearing here, we pause to stop scanning instantly
                 try { html5QrcodeScanner.pause(); } catch (e) {}
                 
                 // Close the modal and navigate
                 onClose();
                 navigate(path);
              } else {
                 setScanError("Scanned code is not a valid device tag.");
              }
            } catch (err) {
              setScanError("Invalid QR Code format.");
            }
          },
          (error) => { /* ignore */ }
        );
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().catch(e => console.error("Failed to clear scanner", e));
        }
      };
    }
  }, [open, navigate, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Scan Asset Tag
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, minHeight: '350px' }}>
        <Typography variant="body2" sx={{ color: 'slate.500', mb: 3, textAlign: 'center' }}>
          Hold the device's QR code steadily in front of your camera.
        </Typography>
        
        {/* Important: Do not use inline styles that override the injected styles. The library injects its own DOM here. */}
        <Box id="qr-reader" sx={{ width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden' }}></Box>

        {scanError && (
          <Typography variant="body2" color="error" component="div" sx={{ mt: 2, fontWeight: 600, textAlign: 'center', bgcolor: 'error.50', p: 1, borderRadius: 1, width: '100%' }}>
            {scanError}
            <br />
            <Button size="small" onClick={() => setScanError(null)} sx={{ mt: 1 }}>Dismiss</Button>
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerModal;
