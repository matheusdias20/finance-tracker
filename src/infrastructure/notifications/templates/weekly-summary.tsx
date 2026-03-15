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
} from '@react-email/components';
import * as React from 'react';

interface WeeklySummaryProps {
  weekLabel: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topCategory: { name: string; amount: number };
  comparedToLastWeek: number;
  transactionCount: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const WeeklySummaryEmail = ({
  weekLabel = '2 a 8 de dezembro',
  totalIncome = 5000,
  totalExpense = 2450.5,
  balance = 2549.5,
  topCategory = { name: 'Lazer', amount: 800 },
  comparedToLastWeek = 15.5,
  transactionCount = 24,
}: WeeklySummaryProps) => {
  const comparisonText = comparedToLastWeek > 0 ? 'mais' : 'menos';
  const comparisonColor = comparedToLastWeek > 0 ? '#A32D2D' : '#0F6E56';

  return (
    <Html>
      <Head />
      <Preview>📊 Resumo da semana: {weekLabel}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Finance Tracker</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Resumo da semana</Heading>
            <Text style={text}>Confira como foram suas finanças de {weekLabel}:</Text>

            <Section style={metricsRow}>
              <Row>
                <Column style={metricCol}>
                  <Text style={metricLabel}>RECEITAS</Text>
                  <Text style={metricValueIncome}>{formatCurrency(totalIncome)}</Text>
                </Column>
                <Column style={metricCol}>
                  <Text style={metricLabel}>GASTOS</Text>
                  <Text style={metricValueExpense}>{formatCurrency(totalExpense)}</Text>
                </Column>
                <Column style={metricCol}>
                  <Text style={metricLabel}>SALDO</Text>
                  <Text style={metricValueBalance}>{formatCurrency(balance)}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={highlightCard}>
              <Heading style={h2}>Destaque da semana</Heading>
              <Text style={textHighlight}>
                Você realizou <strong>{transactionCount}</strong> transações.
              </Text>
              <Text style={textHighlight}>
                A categoria com maior gasto foi <strong>{topCategory.name}</strong>, totalizando <strong>{formatCurrency(topCategory.amount)}</strong>.
              </Text>
              <Text style={{ ...textHighlight, marginTop: '16px' }}>
                Comparado à semana passada, você gastou <strong style={{ color: comparisonColor }}>{Math.abs(comparedToLastWeek)}% {comparisonText}</strong>.
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este é um resumo automático do Finance Tracker.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WeeklySummaryEmail;

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
  margin: '0 0 12px',
};

const text = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const metricsRow = {
  marginTop: '24px',
  marginBottom: '24px',
};

const metricCol = {
  padding: '0 8px',
};

const metricLabel = {
  fontSize: '11px',
  fontWeight: 'bold',
  color: '#666666',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const metricValueIncome = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0F6E56',
  margin: '4px 0 0',
};

const metricValueExpense = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#A32D2D',
  margin: '4px 0 0',
};

const metricValueBalance = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '4px 0 0',
};

const highlightCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  border: '1px solid #e5e7eb',
};

const textHighlight = {
  color: '#1a1a1a',
  fontSize: '15px',
  lineHeight: '22px',
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
