import * as express from 'express';
import { create } from '../controllers/portfolio.controller.js';
import { test } from '../controllers/test.js';
import { createPortfolio } from '../../helper/portfolio.push.create.js';

const router = express.Router();

// Update the route to log request body
router.post('/test', async (req, res, next) => {
    res.json({ 
        message: 'Request body logged',
        receivedData: req.body 
    });
});
router.post('/createPortfolio' , createPortfolio)

export const portfolioRoutes = router;