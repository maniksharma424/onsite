import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project, Payment, Vendor } from './types';
import { format } from 'date-fns';

interface ProjectWithTotals extends Project {
  totalIncoming: number;
  totalOutgoing: number;
  balance: number;
}

export async function generateProjectLedgerPDF(
  project: ProjectWithTotals,
  payments: Payment[],
  vendors: Vendor[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSTRUCTION MANAGEMENT', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.text('PROJECT LEDGER', pageWidth / 2, 28, { align: 'center' });

  // Project Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  let yPos = 40;
  doc.text(`Project: ${project.name}`, 14, yPos);
  yPos += 6;

  if (project.location) {
    doc.text(`Location: ${project.location}`, 14, yPos);
    yPos += 6;
  }

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedPayments.length > 0) {
    const startDate = format(new Date(sortedPayments[0].date), 'dd MMM yyyy');
    const endDate = format(
      new Date(sortedPayments[sortedPayments.length - 1].date),
      'dd MMM yyyy'
    );
    doc.text(`Period: ${startDate} to ${endDate}`, 14, yPos);
    yPos += 6;
  }

  yPos += 4;

  // Table
  const tableData = sortedPayments.map((payment) => {
    const vendor = vendors.find((v) => v.id === payment.partyId);
    const isIncoming = payment.type === 'incoming';

    return [
      format(new Date(payment.date), 'dd MMM yyyy'),
      vendor?.name || 'Unknown',
      isIncoming ? 'IN' : 'OUT',
      formatAmount(payment.amount, isIncoming),
      payment.description || '-',
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Party', 'Type', 'Amount (Rs.)', 'Description']],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 26, halign: 'left' },
      1: { cellWidth: 40, halign: 'left' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 'auto', halign: 'left' },
    },
    didParseCell: (data) => {
      // Color the amount column
      if (data.section === 'body' && data.column.index === 3) {
        const type = data.row.raw?.[2];
        if (type === 'IN') {
          data.cell.styles.textColor = [22, 163, 74];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
      // Color the type column
      if (data.section === 'body' && data.column.index === 2) {
        const type = data.cell.raw;
        if (type === 'IN') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Summary
  // @ts-expect-error - jspdf-autotable adds lastAutoTable
  const finalY = doc.lastAutoTable?.finalY || yPos + 20;

  doc.setDrawColor(200);
  doc.line(14, finalY + 5, pageWidth - 14, finalY + 5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  // Summary box
  const summaryX = pageWidth - 85;
  let summaryY = finalY + 15;

  // Total IN
  doc.setTextColor(22, 163, 74);
  doc.text('Total IN:', summaryX, summaryY);
  doc.text('+Rs. ' + formatNumber(project.totalIncoming), pageWidth - 14, summaryY, {
    align: 'right',
  });

  // Total OUT
  summaryY += 8;
  doc.setTextColor(220, 38, 38);
  doc.text('Total OUT:', summaryX, summaryY);
  doc.text('-Rs. ' + formatNumber(project.totalOutgoing), pageWidth - 14, summaryY, {
    align: 'right',
  });

  // Balance
  summaryY += 8;
  doc.setDrawColor(150);
  doc.line(summaryX, summaryY - 2, pageWidth - 14, summaryY - 2);
  summaryY += 4;
  doc.setTextColor(24, 24, 27);
  doc.text('Balance:', summaryX, summaryY);
  doc.text('Rs. ' + formatNumber(project.balance), pageWidth - 14, summaryY, {
    align: 'right',
  });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`,
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  // Save
  doc.save(`${project.name.replace(/\s+/g, '-').toLowerCase()}-ledger.pdf`);
}

function formatAmount(amount: number, isIncoming: boolean): string {
  const sign = isIncoming ? '+' : '-';
  return `${sign}Rs. ${formatNumber(amount)}`;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.abs(num));
}
