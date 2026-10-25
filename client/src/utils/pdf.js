import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatDate } from './format.js';

// jsPDF's built-in fonts have no rupee glyph, so the PDF writes the currency code instead.
const money = (n, c = 'INR') => `${c} ${Math.round(n || 0).toLocaleString('en-IN')}`;

export const verifyUrlFor = (booking) => `${window.location.origin}/verify/${booking.verificationCode}`;

export async function qrDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 240, color: { dark: '#06111F', light: '#FFFFFF' } });
}

export async function downloadConfirmationPdf(booking) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const s = booking.snapshot;
  const p = booking.pricing;

  doc.setFillColor(6, 17, 31);
  doc.rect(0, 0, W, 110, 'F');
  doc.setTextColor(242, 190, 98);
  doc.setFont('helvetica', 'bold').setFontSize(26).text('StayEase', 40, 55);
  doc.setTextColor(248, 250, 252).setFontSize(11).setFont('helvetica', 'normal').text('Booking confirmation (demo)', 40, 78);
  doc.setFontSize(10).text(`Reference: ${booking.reference}`, W - 40, 55, { align: 'right' });
  doc.text(`Status: ${booking.displayStatus}`, W - 40, 72, { align: 'right' });

  let y = 150;
  const row = (label, value) => {
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(90, 100, 115).text(label.toUpperCase(), 40, y);
    doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(20, 30, 45).text(String(value), 190, y);
    y += 26;
  };

  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(20, 30, 45).text(s.hotelName, 40, y);
  y += 20;
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(90, 100, 115).text(`${s.address}, ${s.city}, ${s.country}`, 40, y);
  y += 34;

  row('Check-in', `${formatDate(booking.checkIn)} from ${s.checkInTime}`);
  row('Check-out', `${formatDate(booking.checkOut)} until ${s.checkOutTime}`);
  row('Room', `${s.roomTypeName} x ${booking.rooms}`);
  row('Guests', `${booking.adults} adult(s), ${booking.children} child(ren)`);
  row('Lead guest', booking.guest.fullName);
  row('Payment', `${booking.payment.method.replace(/_/g, ' ')} - ${booking.payment.status.replace(/_/g, ' ')} (DEMO)`);
  y += 10;

  doc.setDrawColor(220, 225, 232).line(40, y, W - 40, y);
  y += 24;
  const price = (label, value, bold) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 13 : 11).setTextColor(20, 30, 45);
    doc.text(label, 40, y);
    doc.text(value, W - 40, y, { align: 'right' });
    y += bold ? 26 : 20;
  };
  price(`${money(p.pricePerNight, p.currency)} x ${p.nights} night(s) x ${booking.rooms} room(s)`, money(p.subtotal, p.currency));
  if (p.discount) price(`Discount${p.discountLabel ? ` (${p.discountLabel})` : ''}`, `- ${money(p.discount, p.currency)}`);
  price(`Taxes (${p.taxRatePercent}%)`, money(p.taxes, p.currency));
  price('Total', money(p.total, p.currency), true);

  const qr = await qrDataUrl(verifyUrlFor(booking));
  doc.addImage(qr, 'PNG', W - 40 - 120, y + 10, 120, 120);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90, 100, 115);
  doc.text('Scan to verify this booking.', 40, y + 30);
  doc.text('Cancellation policy:', 40, y + 52);
  doc.text(doc.splitTextToSize(s.cancellationPolicy || '', W - 240), 40, y + 66);
  doc.text('StayEase is a demo project. Hotels are fictional and no real payment was taken.', 40, 800);

  doc.save(`StayEase-${booking.reference}.pdf`);
}
