import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface BudgetExceededProps {
  categoryName: string;
  categoryColor: string;
  limitAmount: number;
  spentAmount: number;
  percentageUsed: number;
  topTransactions: Array<{ description: string; amount: number; date: string }>;
  month: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const BudgetExceededEmail = ({
  categoryName = 'Alimentação',
  categoryColor = '#0F6E56',
  limitAmount = 1000,
  spentAmount = 1250,
  percentageUsed = 125,
  topTransactions = [
    { description: 'Restaurante', amount: 80, date: '12/12/2024' },
    { description: 'Supermercado', amount: 450, date: '10/12/2024' },
    { description: 'Lanche', amount: 35, date: '08/12/2024' },
  ],
  month = 'Dezembro 2024',
}: BudgetExceededProps) => {
  const progressBlocks = Math.min(Math.floor(percentageUsed / 10), 10);
  const progressBar = '█'.repeat(progressBlocks) + '░'.repeat(10 - progressBlocks);

  return (
    <Html>
      <Head />
      <Preview>{`⚠️ Orçamento de ${categoryName} atingiu ${percentageUsed}%`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Finance Tracker</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Limite de orçamento ultrapassado</Heading>
            <Text style={text}>
              Olá, você ultrapassou o limite definido para a categoria <strong>{categoryName}</strong> em <strong>{month}</strong>.
            </Text>

            <Section style={card}>
              <Row>
                <Column>
                  <Text style={cardLabel}>CATEGORIA</Text>
                  <Text style={{ ...cardValue, color: categoryColor }}>{categoryName}</Text>
                </Column>
                <Column align="right">
                  <Text style={cardLabel}>STATUS</Text>
                  <Text style={percentageText}>{percentageUsed}%</Text>
                </Column>
              </Row>
              <Hr style={hr} />
              <Row>
                <Column>
                  <Text style={cardLabel}>LIMITE</Text>
                  <Text style={cardValueSmall}>{formatCurrency(limitAmount)}</Text>
                </Column>
                <Column align="right">
                  <Text style={cardLabel}>GASTO</Text>
                  <Text style={{ ...cardValueSmall, color: '#A32D2D' }}>{formatCurrency(spentAmount)}</Text>
                </Column>
              </Row>
              <Section style={progressBarContainer}>
                <Text style={progressBarText}>
                  {progressBar} {percentageUsed}%
                </Text>
              </Section>
            </Section>

            <Heading style={h2}>Últimas transações</Heading>
            <Section style={tableContainer}>
              {topTransactions.map((tx, index) => (
                <Row key={index} style={index === 0 ? tableRowFirst : tableRow}>
                  <Column style={tableCell}>
                    <Text style={txDesc}>{tx.description}</Text>
                    <Text style={txDate}>{tx.date}</Text>
                  </Column>
                  <Column align="right" style={tableCell}>
                    <Text style={txAmount}>{formatCurrency(tx.amount)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${baseUrl}/dashboard`}>
                Acesse o painel para mais detalhes
              </Button>
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

export default BudgetExceededEmail;

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

const text = {
  color: '#666666',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const card = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  marginTop: '24px',
  border: '1px solid #e5e7eb',
};

const cardLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const cardValue = {
  fontSize: '20px',
  fontWeight: '700',
  margin: '4px 0 0',
};

const cardValueSmall = {
  fontSize: '16px',
  fontWeight: '600',
  margin: '4px 0 0',
};

const percentageText = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#A32D2D',
  margin: '4px 0 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const progressBarContainer = {
  marginTop: '16px',
};

const progressBarText = {
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#0F6E56',
  margin: '0',
};

const tableContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden' as const,
};

const tableRow = {
  borderTop: '1px solid #e5e7eb',
};

const tableRowFirst = {};

const tableCell = {
  padding: '12px 16px',
};

const txDesc = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '600',
  color: '#1a1a1a',
};

const txDate = {
  margin: '2px 0 0',
  fontSize: '12px',
  color: '#666666',
};

const txAmount = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '700',
  color: '#1a1a1a',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#0F6E56',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '100%',
  padding: '12px 0',
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
