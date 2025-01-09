import { Section, Table } from '@radix-ui/themes';
import { db } from '../data/db';
import { DbTripWithActivityAccommodation } from '../Trip/db';

export function ExpenseList({
  trip,
}: {
  trip: DbTripWithActivityAccommodation;
}) {
  const { isLoading, error, data } = db.useQuery({
    expense: {
      $: {
        where: {
          'trip.id': trip.id,
        },
      },
    },
  });

  const expenses = data?.expense ?? [];

  return (
    <Section py="0">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Date Incurred</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Currency</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Currency Conversion Factor
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Amount in Origin's Currency
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {expenses.map((expense) => {
            return (
              <Table.Row key={expense.id}>
                <Table.RowHeaderCell>
                  {expense.timestampIncurred}
                </Table.RowHeaderCell>
                <Table.Cell>{expense.title}</Table.Cell>
                <Table.Cell>{expense.description}</Table.Cell>
                <Table.Cell>{expense.currency}</Table.Cell>
                <Table.Cell>{expense.amount}</Table.Cell>
                <Table.Cell>{expense.currencyConversionFactor}</Table.Cell>
                <Table.Cell>{expense.amountInOriginCurrency}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      {isLoading ? 'Loading expenses' : error ? `Error: ${error.message}` : ''}
    </Section>
  );
}
