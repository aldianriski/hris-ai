'use client';

import { Card, CardHeader, CardBody, Input, Accordion, AccordionItem, Chip } from '@heroui/react';
import { Search, BookOpen, HelpCircle, FileText, Video, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
}

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'attendance', name: 'Attendance & Clock In/Out', icon: BookOpen, count: 12 },
    { id: 'leaves', name: 'Leave Management', icon: FileText, count: 15 },
    { id: 'payroll', name: 'Payroll & Salary', icon: HelpCircle, count: 18 },
    { id: 'documents', name: 'Documents & Files', icon: FileText, count: 8 },
    { id: 'performance', name: 'Performance Reviews', icon: BookOpen, count: 10 },
    { id: 'account', name: 'Account & Settings', icon: HelpCircle, count: 7 },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'attendance',
      question: 'How do I clock in for work?',
      answer:
        'To clock in, go to the Attendance page and click the "Clock In" button. You may be required to enable location services to verify you are at the office location. For remote work, ensure you have the proper permissions set up.',
      helpful: 45,
    },
    {
      id: '2',
      category: 'attendance',
      question: 'What if I forget to clock out?',
      answer:
        'If you forget to clock out, contact your manager or HR department immediately. They can manually adjust your attendance record. Repeated failures to clock out may be flagged by the system.',
      helpful: 32,
    },
    {
      id: '3',
      category: 'leaves',
      question: 'How do I request annual leave?',
      answer:
        'Go to the Leaves page, click "Request Leave", select "Annual Leave" as the type, choose your dates, provide a reason, and submit. Your manager will be notified for approval. You can track the status in your leave dashboard.',
      helpful: 67,
    },
    {
      id: '4',
      category: 'leaves',
      question: 'How many days of annual leave do I have?',
      answer:
        'Indonesian labor law provides 12 days of annual leave per year. You can view your remaining balance on the Leaves page under "Leave Balance". Unused leave may be carried forward according to company policy.',
      helpful: 58,
    },
    {
      id: '5',
      category: 'payroll',
      question: 'When will I receive my salary?',
      answer:
        'Salaries are typically processed on the 25th of each month. If the 25th falls on a weekend or holiday, payment will be made on the previous working day. You can download your payslip from the My Documents page.',
      helpful: 89,
    },
    {
      id: '6',
      category: 'payroll',
      question: 'How is my PPh21 tax calculated?',
      answer:
        'PPh21 (income tax) is calculated based on Indonesian tax brackets. The system automatically calculates tax deductions based on your gross salary, allowances, and PTKP (non-taxable income) status. You can view the breakdown in your payslip.',
      helpful: 42,
    },
    {
      id: '7',
      category: 'documents',
      question: 'How do I upload my BPJS documents?',
      answer:
        'Go to My Documents, click "Upload", select "Personal Documents" category, choose your BPJS Kesehatan or Ketenagakerjaan card file (PDF or image), and submit. HR will review and verify your documents within 2 business days.',
      helpful: 36,
    },
    {
      id: '8',
      category: 'documents',
      question: 'Can I download previous payslips?',
      answer:
        'Yes! Go to My Documents page and filter by "Payslips". All your historical payslips are available for download in PDF format. You can also export all payslips at once.',
      helpful: 51,
    },
    {
      id: '9',
      category: 'performance',
      question: 'How often are performance reviews conducted?',
      answer:
        'Performance reviews are typically conducted quarterly and annually. Quarterly reviews focus on OKR progress, while annual reviews include comprehensive 360-degree feedback. You will receive notifications when it\'s time for a review.',
      helpful: 28,
    },
    {
      id: '10',
      category: 'account',
      question: 'How do I change my password?',
      answer:
        'Go to Settings > Security, click "Change Password", enter your current password, then your new password twice for confirmation. For security, we recommend using a password with at least 8 characters, including numbers and symbols.',
      helpful: 73,
    },
    {
      id: '11',
      category: 'account',
      question: 'How do I enable Two-Factor Authentication (2FA)?',
      answer:
        'Go to Settings > Security, find the "Two-Factor Authentication" section, click "Enable", scan the QR code with Google Authenticator or Authy, enter the verification code, and save your backup codes in a safe place.',
      helpful: 39,
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardBody className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">How can we help you?</h2>
            <p className="text-default-600">Search our knowledge base for answers</p>
          </div>
          <Input
            placeholder="Search for help articles, FAQs, or guides..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="h-5 w-5 text-default-400" />}
            size="lg"
            className="max-w-2xl mx-auto"
          />
        </CardBody>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-50 dark:bg-primary-100/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-sm text-default-500">{category.count} articles</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
        </CardHeader>
        <CardBody>
          <Accordion variant="splitted">
            {filteredFAQs.map((faq) => (
              <AccordionItem
                key={faq.id}
                aria-label={faq.question}
                title={
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-medium">{faq.question}</span>
                    <Chip size="sm" variant="flat" className="capitalize">
                      {faq.category}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-3 pb-4">
                  <p className="text-default-700">{faq.answer}</p>
                  <div className="flex items-center gap-4 pt-3 border-t border-default-200">
                    <p className="text-sm text-default-500">Was this helpful?</p>
                    <div className="flex gap-2">
                      <Chip size="sm" variant="flat" color="success">
                        👍 Yes ({faq.helpful})
                      </Chip>
                      <Chip size="sm" variant="flat">
                        👎 No
                      </Chip>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 mx-auto text-default-300 mb-4" />
              <p className="text-default-500">No results found for "{searchQuery}"</p>
              <p className="text-sm text-default-400 mt-2">Try different keywords or browse categories above</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardBody className="p-6">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
            <p className="text-default-600 mb-4">Can't find what you're looking for? Contact our support team.</p>
            <div className="flex justify-center gap-4">
              <Chip variant="bordered" startContent={<MessageCircle className="h-4 w-4" />}>
                Live Chat
              </Chip>
              <Chip variant="bordered" startContent={<FileText className="h-4 w-4" />}>
                Submit Ticket
              </Chip>
              <Chip variant="bordered">
                support@company.com
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
