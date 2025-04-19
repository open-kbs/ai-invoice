import React from "react";
import { Avatar, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, useMediaQuery, useTheme } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export const ProductsTable = ({ products, handleClick }) => {
    if (!products || products.length === 0) return <div>No products available</div>;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const columnKeys = Object.keys(products[0]);
    const mobileColumnKeys = ['name', 'price'];
    const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    console.log(products)
    return (
        <TableContainer component={Paper} sx={{ marginTop: 2, maxWidth: '100%', overflowX: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ padding: '4px' }}></TableCell>
                        {(isMobile ? mobileColumnKeys : columnKeys).map((key) => (
                            <TableCell key={key}>{capitalizeFirstLetter(key)}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell sx={{ padding: 2 }}>
                                <IconButton
                                    color="primary"
                                    onClick={() => {
                                        handleClick(product)
                                    }}
                                    size="small"
                                    sx={{
                                        padding: '4px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        borderRadius: '50%',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        },
                                    }}
                                >
                                    <PlayArrowIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                            {(isMobile ? mobileColumnKeys : columnKeys).map((key) => (
                                <TableCell key={key}>
                                    {key === 'image' ?
                                        <Avatar alt={product.name} src={product[key]} variant="square" /> :
                                        (key === 'name' && isMobile ?
                                                <div>
                                                    {product[key]}
                                                    <br />
                                                    <small style={{color: 'gray'}}>{product.description}</small>
                                                </div> :
                                                product[key]
                                        )
                                    }
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}