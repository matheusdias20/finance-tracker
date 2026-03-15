import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface MonthlySummaryProps {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categorySummary: Array<{
    name: string;
    amount: number;
    percentage: number;
    limitAmount: number | null;
    exceeded: boolean;
  }>;
  goalsAchieved: number;
  goalsExceeded: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const MonthlySummaryEmail = ({
  month = 'Novembro 2024',
  totalIncome = 12000,
  totalExpense = 8500,
  balance = 3500,
  categorySummary = [
    { name: 'Alimentação', amount: 1200, percentage: 14.1, limitAmount: 1000, exceeded: true },
    { name: 'Transporte', amount: 800, percentage: 9.4, limitAmount: 900, exceeded: false },
    { name: 'Lazer', amount: 1500, percentage: 17.6, limitAmount: 1500, exceeded: false },
    { name: 'Moradia', amount: 3500, percentage: 41.2, limitAmount: 3500, exceeded: false },
  ],
  goalsAchieved = 3,
  goalsExceeded = 1,
}: MonthlySummaryProps) => {
  return (
    <Html>
      <Head />
      <Preview>📅 Fechamento de {month}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Finance Tracker</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Fechamento de {month}</Heading>
            
            <Section style={summaryGrid}>
              <Row>
                <Column style={summaryBox}>
                  <Text style={metricLabel}>RECEITAS</Text>
                  <Text style={metricValueIncome}>{formatCurrency(totalIncome)}</Text>
                </Column>
                <Column style={summaryBox}>
                  <Text style={metricLabel}>GASTOS</Text>
                  <Text style={metricValueExpense}>{formatCurrency(totalExpense)}</Text>
                </Column>
                <Column style={summaryBox}>
                  <Text style={metricLabel}>SALDO</Text>
                  <Text style={metricValueBalance}>{formatCurrency(balance)}</Text>
                </Column>
              </Row>
            </Section>

            <Heading style={h2}>Resumo por categoria</Heading>
            <Section style={tableContainer}>
              <Row style={tableHeader}>
                <Column style={{ ...tableHeaderCell, width: '40%' }}>Categoria</Column>
                <Column style={{ ...tableHeaderCell, width: '30%', textAlign: 'right' }}>Valor</Column>
                <Column style={{ ...tableHeaderCell, width: '30%', textAlign: 'right' }}>Status</Column>
              </Row>
              {categorySummary.map((cat, index) => (
                <Row key={index} style={index === 0 ? {} : tableRow}>
                  <Column style={{ ...tableCell, width: '40%' }}>
                    <Text style={catName}>{cat.name}</Text>
                    <Text style={catPercent}>{cat.percentage}% do total</Text>
                  </Column>
                  <Column style={{ ...tableCell, width: '30%', textAlign: 'right' }}>
                    <Text style={catAmount}>{formatCurrency(cat.amount)}</Text>
                  </Column>
                  <Column style={{ ...tableCell, width: '30%', textAlign: 'right' }}>
                    <Text style={cat.exceeded ? statusExceeded : statusOk}>
                      {cat.exceeded ? '❌ Excedeu' : '✅ Dentro'}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={hr} />
            <Section style={footerGoals}>
              <Text style={goalsText}>
                🎯 <strong>Progresso do mês:</strong> {goalsAchieved} metas atingidas, {goalsExceeded} excedidas.
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este é um fechamento automático do Finance Tracker.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MonthlySummaryEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '0 48px',
};

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0F6E56',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  marginTop: '32px',
  marginBottom: '16px',
};

const summaryGrid = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #e5e7eb',
};

const summaryBox = {
  padding: '0 10px',
};

const metricLabel = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#666666',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const metricValueIncome = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0F6E56',
  margin: '4px 0 0',
};

const metricValueExpense = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#A32D2D',
  margin: '4px 0 0',
};

const metricValueBalance = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '4px 0 0',
};

const tableContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden' as const,
};

const tableHeader = {
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
};

const tableHeaderCell = {
  padding: '12px 16px',
  color: '#666666',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
};

const tableRow = {
  borderTop: '1px solid #e5e7eb',
};

const tableCell = {
  padding: '12px 16px',
};

const catName = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1a1a1a',
};

const catPercent = {
  margin: '2px 0 0',
  fontSize: '12px',
  color: '#666666',
};

const catAmount = {
  margin: '0',
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1a1a1a',
};

const statusOk = {
  margin: '0',
  fontSize: '13px',
  fontWeight: '500',
  color: '#0F6E56',
};

const statusExceeded = {
  margin: '0',
  fontSize: '13px',
  fontWeight: '500',
  color: '#A32D2D',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 16px',
};

const footerGoals = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
};

const goalsText = {
  fontSize: '14px',
  color: '#1a1a1a',
  margin: '0',
};

const footer = {
  padding: '0 48px',
  marginTop: '32px',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
};
