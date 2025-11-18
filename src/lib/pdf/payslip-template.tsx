/**
 * Payslip PDF Template
 * Generated using @react-pdf/renderer
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #667eea',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    backgroundColor: '#f3f4f6',
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    color: '#222',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  tableCol50: {
    width: '50%',
    paddingHorizontal: 5,
  },
  tableCol25: {
    width: '25%',
    paddingHorizontal: 5,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 10,
    borderTop: '2 solid #333',
  },
  totalLabel: {
    width: '50%',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalValue: {
    width: '50%',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#10b981',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
});

export interface PayslipData {
  // Company info
  companyName: string;
  companyAddress?: string;

  // Employee info
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;

  // Period info
  month: string;
  year: number;
  periodStart: string;
  periodEnd: string;

  // Salary components
  baseSalary: number;
  allowances: number;
  overtime: number;
  grossSalary: number;

  // Deductions
  bpjsKesehatan: number;
  bpjsJHT: number;
  bpjsJP: number;
  pph21: number;
  totalDeductions: number;

  // Net salary
  netSalary: number;

  // Additional info
  generatedDate: string;
}

/**
 * Format currency in IDR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Payslip PDF Document
 */
export function PayslipDocument(props: PayslipData): JSX.Element {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{props.companyName}</Text>
          {props.companyAddress && (
            <Text style={{ fontSize: 9, color: '#666' }}>{props.companyAddress}</Text>
          )}
          <Text style={styles.title}>SLIP GAJI / PAYSLIP</Text>
          <Text style={{ fontSize: 11, marginTop: 5 }}>
            {props.month} {props.year}
          </Text>
        </View>

        {/* Employee Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI KARYAWAN / EMPLOYEE INFORMATION</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nama / Name:</Text>
            <Text style={styles.value}>{props.employeeName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID Karyawan / Employee ID:</Text>
            <Text style={styles.value}>{props.employeeId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Posisi / Position:</Text>
            <Text style={styles.value}>{props.position}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Departemen / Department:</Text>
            <Text style={styles.value}>{props.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Periode / Period:</Text>
            <Text style={styles.value}>
              {props.periodStart} - {props.periodEnd}
            </Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PENDAPATAN / EARNINGS</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol50}>Deskripsi / Description</Text>
              <Text style={styles.tableCol25}>Jumlah / Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>Gaji Pokok / Base Salary</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.baseSalary)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>Tunjangan / Allowances</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.allowances)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>Lembur / Overtime</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.overtime)}</Text>
            </View>
            <View style={[styles.tableRow, { fontWeight: 'bold', backgroundColor: '#f9fafb' }]}>
              <Text style={styles.tableCol50}>Total Pendapatan / Gross Salary</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.grossSalary)}</Text>
            </View>
          </View>
        </View>

        {/* Deductions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POTONGAN / DEDUCTIONS</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCol50}>Deskripsi / Description</Text>
              <Text style={styles.tableCol25}>Jumlah / Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>BPJS Kesehatan</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.bpjsKesehatan)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>BPJS Ketenagakerjaan (JHT)</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.bpjsJHT)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>BPJS Jaminan Pensiun (JP)</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.bpjsJP)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol50}>PPh 21 (Pajak Penghasilan)</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.pph21)}</Text>
            </View>
            <View style={[styles.tableRow, { fontWeight: 'bold', backgroundColor: '#f9fafb' }]}>
              <Text style={styles.tableCol50}>Total Potongan / Total Deductions</Text>
              <Text style={styles.tableCol25}>{formatCurrency(props.totalDeductions)}</Text>
            </View>
          </View>
        </View>

        {/* Net Salary */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>GAJI BERSIH / NET SALARY:</Text>
          <Text style={styles.totalValue}>{formatCurrency(props.netSalary)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Dokumen ini dibuat secara otomatis dan tidak memerlukan tanda tangan.
          </Text>
          <Text>
            This document is generated automatically and does not require a signature.
          </Text>
          <Text style={{ marginTop: 5 }}>
            Dicetak pada / Printed on: {props.generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
