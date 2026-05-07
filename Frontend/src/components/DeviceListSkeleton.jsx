import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const DeviceListSkeleton = () => {
    return (
        <Box sx={{ maxWidth: '1800px', mx: 'auto', px: { xs: 2, xl: 3 } }}>
            {/* Header Skeleton */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', xl: 'center' }, gap: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: '16px' }} />
                    <Box>
                        <Skeleton variant="text" width={250} height={40} />
                        <Skeleton variant="text" width={300} height={24} />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="rounded" width={300} height={48} sx={{ borderRadius: '12px' }} />
                    <Skeleton variant="rounded" width={140} height={48} sx={{ borderRadius: '12px' }} />
                    <Skeleton variant="rounded" width={120} height={48} sx={{ borderRadius: '12px' }} />
                    <Skeleton variant="rounded" width={120} height={48} sx={{ borderRadius: '12px' }} />
                </Box>
            </Box>

            {/* Table Skeleton */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f1f5f9', maxWidth: '1800px', mx: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <TableCell key={i}>
                                    <Skeleton variant="text" width={80} height={20} />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                            <TableRow key={row}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Skeleton variant="text" width={150} height={24} />
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '6px' }} />
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '6px' }} />
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Skeleton variant="text" width={120} height={20} />
                                        <Skeleton variant="rounded" width={100} height={20} sx={{ borderRadius: '6px' }} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Skeleton variant="text" width={100} height={22} />
                                        <Skeleton variant="text" width={80} height={18} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="text" width={100} height={20} />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="text" width={120} height={18} />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '8px' }} />
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: '14px' }} />
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <Skeleton key={i} variant="circular" width={36} height={36} />
                                        ))}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DeviceListSkeleton;
