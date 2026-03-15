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

interface RecurringReminderProps {
  transactions: Array<{
    description: string;
    amount: number;
    categoryName: string;
    nextOccurrence: string;
    daysUntil: number;
  }>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getBadgeStyle = (days: number) => {
  if (days === 0) return badgeToday;
  if (days === 1) return badgeTomorrow;
  return badgeSoon;
};

const getBadgeLabel = (days: number) => {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
};

export const RecurringReminderEmail = ({
  transactions = [
    { description: 'Aluguel', amount: 1500, categoryName: 'Habitação', nextOccurrence: '20/12/2024', daysUntil: 1 },
    { description: 'Netflix', amount: 55.9, categoryName: 'Lazer', nextOccurrence: '20/12/2024', daysUntil: 1 },
    { description: 'Academia', amount: 110, categoryName: 'Saúde', nextOccurrence: '21/12/2024', daysUntil: 2 },
  ],
}: RecurringReminderProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`📅 ${transactions.length} transação(ões) recorrente(s) vencem em breve`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Finance Tracker</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Lembrete de pagamentos recorrentes</Heading>
            <Text style={text}>
              As seguintes transações recorrentes estão agendadas para os próximos dias:
            </Text>

            <Section style={tableContainer}>
              {transactions.map((tx, index) => (
                <Section key={index} style={index === 0 ? tableRowFirst : tableRow}>
                  <Row style={{ padding: '16px' }}>
                    <Column>
                      <Text style={txDesc}>{tx.description}</Text>
                      <Text style={txCat}>{tx.categoryName}</Text>
                    </Column>
                    <Column align="right">
                      <Text style={txAmount}>{formatCurrency(tx.amount)}</Text>
                      <Text style={txDate}>{tx.nextOccurrence}</Text>
                      <Section style={{ marginTop: '8px' }}>
                        <span style={getBadgeStyle(tx.daysUntil)}>{getBadgeLabel(tx.daysUntil)}</span>
                      </Section>
                    </Column>
                  </Row>
                </Section>
              ))}
            </Section>

            <Section style={warningBox}>
              <Text style={warningText}>
                ⚠️ <strong>Aviso:</strong> Certifique-se de ter saldo disponível na sua conta para estes pagamentos.
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Este é um aviso automático do Finance Tracker.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RecurringReminderEmail;

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

const text = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const tableContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  marginTop: '24px',
  overflow: 'hidden' as const,
};

const tableRow = {
  borderTop: '1px solid #e5e7eb',
};

const tableRowFirst = {};

const txDesc = {
  margin: '0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
};

const txCat = {
  margin: '2px 0 0',
  fontSize: '14px',
  color: '#666666',
};

const txAmount = {
  margin: '0',
  fontSize: '16px',
  fontWeight: '700',
  color: '#1a1a1a',
};

const txDate = {
  margin: '2px 0 0',
  fontSize: '13px',
  color: '#666666',
};

const badgeToday = {
  backgroundColor: '#FEE2E2',
  color: '#A32D2D',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '4px',
  display: 'inline-block',
};

const badgeTomorrow = {
  backgroundColor: '#FEF3C7',
  color: '#854F0B',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '4px',
  display: 'inline-block',
};

const badgeSoon = {
  backgroundColor: '#E1F3EE',
  color: '#0F6E56',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '4px',
  display: 'inline-block',
};

const warningBox = {
  backgroundColor: '#fffdf0',
  border: '1px solid #FEF3C7',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '24px',
};

const warningText = {
  color: '#854F0B',
  fontSize: '14px',
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
