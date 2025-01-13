const express = require('express');
const router = express.Router();
const { getRevenueData, getTopProductsData } = require('../model/dashboardModel');

router.get('/revenue', async (req, res) => {
    const timeRange = req.query.timeRange || 'day';
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const data = await getRevenueData(timeRange, startDate);

    const formattedData = {
        labels: data.map(item => {
            const date = new Date(item.date);
            const options = timeRange === 'day' ? { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' } : { month: 'short', day: '2-digit' };
            return date.toLocaleDateString('en-US', options);
        }),
        values: data.map(item => item.revenue)
    };

    res.json(formattedData);
});

router.get('/top-products', async (req, res) => {
    const timeRange = req.query.timeRange || 'day';
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const data = await getTopProductsData(timeRange, startDate);

    const formattedData = {
        labels: data.map(item => item.product_name),
        values: data.map(item => item.revenue)
    };

    res.json(formattedData);
});

module.exports = router;