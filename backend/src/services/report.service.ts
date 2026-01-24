import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { Response } from 'express';
import { EnvironmentalMetricType } from '@prisma/client';

export class ReportService {
    /**
     * Generate Environmental Impact Report
     */
    async generateEnvironmentalReport(res: Response) {
        // Fetch data
        const metrics = await prisma.environmentalMetric.findMany({
            orderBy: { metricDate: 'desc' },
            take: 100, // Last 100 records
            include: { destination: true }
        });

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Pipe to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=environmental-report.pdf');
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('SustainaTour - Environmental Impact Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Calculate Stats
        const aqiMetrics = metrics.filter((m: any) => m.metricType === EnvironmentalMetricType.AIR_QUALITY_INDEX);
        const carbonMetrics = metrics.filter((m: any) => m.metricType === EnvironmentalMetricType.CARBON_FOOTPRINT);

        const avgAQI = aqiMetrics.length > 0
            ? aqiMetrics.reduce((acc: number, m: any) => acc + Number(m.value), 0) / aqiMetrics.length
            : 0;

        const totalCarbon = carbonMetrics.reduce((acc: number, m: any) => acc + Number(m.value), 0);

        // Summary Section
        doc.fontSize(16).text('Executive Summary');
        doc.moveDown();

        doc.fontSize(12).text(`Total Records Analyzed: ${metrics.length}`);
        doc.text(`Average Air Quality Index (AQI): ${avgAQI.toFixed(2)}`);
        doc.text(`Total Carbon Footprint Recorded: ${totalCarbon.toFixed(2)} kg CO2`);
        doc.moveDown(2);

        // Usage Guidelines
        doc.fontSize(14).text("Environmental Safety Guidelines");
        doc.moveDown();
        doc.fontSize(10).text("1. AQI > 150: Limit visitor entry by 50%.");
        doc.text("2. Waste > 500kg: Deploy additional cleanup crews.");
        doc.text("3. Energy Usage: Monitor peak hours between 11 AM - 3 PM.");
        doc.moveDown(2);

        // Data Table
        doc.fontSize(14).text('Recent Measurements');
        doc.moveDown();

        const tableTop = 350;
        const itemHeight = 20;

        // Headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 50, tableTop);
        doc.text('Destination', 150, tableTop);
        doc.text('Metric Type', 300, tableTop);
        doc.text('Value', 450, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Rows
        let yPosition = tableTop + 25;
        doc.font('Helvetica');

        metrics.slice(0, 15).forEach((metric: any) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            doc.text(new Date(metric.metricDate).toLocaleDateString(), 50, yPosition);
            doc.text(metric.destination?.name || 'N/A', 150, yPosition);

            // Format Metric Type
            const typeName = metric.metricType.replace(/_/g, ' ');
            doc.text(typeName, 300, yPosition);

            // Color code logic if needed (simplified here)
            const val = Number(metric.value);
            if (metric.metricType === EnvironmentalMetricType.AIR_QUALITY_INDEX && val > 150) {
                doc.fillColor('red');
            } else {
                doc.fillColor('black');
            }

            doc.text(`${val} ${metric.unit || ''}`, 450, yPosition);
            doc.fillColor('black'); // Reset

            yPosition += itemHeight;
        });

        // Footer
        doc.fontSize(8).text('SustainaTour | Government of India | Sustainable Tourism Initiative',
            50,
            doc.page.height - 50,
            { align: 'center', width: 500 }
        );

        doc.end();
    }
}

export const reportService = new ReportService();
