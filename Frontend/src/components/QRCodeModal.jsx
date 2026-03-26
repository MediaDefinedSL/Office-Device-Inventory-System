import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeModal = ({ open, onClose, device }) => {
  if (!device) return null;

  // Link that redirects to the device edit page
  const deviceUrl = `${window.location.origin}/edit/${device._id}`;

  const downloadQR = () => {
    const svg = document.getElementById("device-qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw SVG on top
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${device.serialNumber || device.brand}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    // Add missing encoding for the SVG string
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
          Device Asset Tag (QR)
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
      
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
        <Box sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '16px', bgcolor: 'white', mb: 3 }}>
          <QRCodeSVG
            id="device-qr-code"
            value={deviceUrl}
            size={256}
            level={"H"}
            includeMargin={true}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'slate.800' }}>
          {device.brand} {device.model}
        </Typography>
        <Typography variant="body2" sx={{ color: 'slate.500', fontWeight: 600, fontFamily: 'monospace', mt: 1 }}>
          S/N: {device.serialNumber}
        </Typography>
        <Typography variant="caption" sx={{ color: 'slate.400', mt: 2, textAlign: 'center', maxWidth: '80%' }}>
          Scan this QR code with any mobile device to quickly access and update this asset's details.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} sx={{ color: 'slate.600', fontWeight: 600 }}>Cancel</Button>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />} 
          onClick={downloadQR}
          sx={{ 
            borderRadius: '12px', 
            textTransform: 'none', 
            fontWeight: 700,
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          Download Tag
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeModal;
