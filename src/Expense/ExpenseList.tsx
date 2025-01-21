import { useState } from 'react';
import {
  Button,
  Flex,
  Popover,
  Section,
  Table,
  Text,
  Tooltip,
} from '@radix-ui/themes';
import { db } from '../data/db';
import { DbTripWithActivityAccommodation } from '../Trip/db';
import {
  PlusIcon,
  QuestionMarkCircledIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { ExpenseMode } from './ExpenseMode';
import { formatTimestampToReadableDate } from './time';
import { DateTime } from 'luxon';
import { useBoundStore } from '../data/store';
import { dbDeleteExpense } from './db';
import s from './ExpenseList.module.css';
import { ExpenseInlineForm } from './ExpenseInlineForm';

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

  const publishToast = useBoundStore((state) => state.publishToast);

  const [expenseMode, setExpenseMode] = useState(ExpenseMode.View);

  return (
    <Section py="0">
      <Table.Root>
        <colgroup>
          <col className={s.tableCellDateIncurred} />
          <col className={s.tableCellTitle} />
          <col className={s.tableCellDescription} />
          <col className={s.tableCellCurrency} />
          <col className={s.tableCellAmount} />
          <col className={s.tableCellCurrencyConversionFactor} />
          <col className={s.tableCellAmountInOriginCurrency} />
          <col className={s.tableCellActions} />
        </colgroup>
        <Table.Header className={s.tableHeader}>
          <Table.Row>
            <Table.ColumnHeaderCell>Date Incurred</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Currency</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Currency Conversion Factor
              <Tooltip
                content={`How much does 1 unit of origin's currency is worth in the entry's currency. This is equal to "Amount" divided by "Amount in Origin's Currency".`}
              >
                <QuestionMarkCircledIcon
                  style={{ verticalAlign: `-3px`, marginLeft: '3px' }}
                />
              </Tooltip>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Amount in Origin's Currency
              {trip.originCurrency ? ` (${trip.originCurrency})` : ''}
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {expenses.map((expense) => (
            <Table.Row key={expense.id}>
              <Table.RowHeaderCell>
                {formatTimestampToReadableDate(
                  DateTime.fromMillis(expense.timestampIncurred)
                )}
              </Table.RowHeaderCell>
              <Table.Cell>{expense.title}</Table.Cell>
              <Table.Cell>{expense.description}</Table.Cell>
              <Table.Cell>{expense.currency}</Table.Cell>
              <Table.Cell>{expense.amount}</Table.Cell>
              <Table.Cell>{expense.currencyConversionFactor}</Table.Cell>
              <Table.Cell>{expense.amountInOriginCurrency}</Table.Cell>
              <Table.Cell>
                {/* TODO: implement Edit, make it inline edit? */}
                <Popover.Root>
                  <Popover.Trigger>
                    <Button variant="outline">
                      <TrashIcon />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content>
                    <Text as="p" size="2">
                      Delete expense "{expense.title}"?
                    </Text>
                    <Text as="p" size="2" color="red">
                      {/* TODO: implement undo delete */}
                      This action is irreversible!
                    </Text>
                    <Flex gap="3" mt="4" justify="end">
                      <Popover.Close>
                        <Button variant="soft" color="gray">
                          Cancel
                        </Button>
                      </Popover.Close>
                      <Button
                        variant="solid"
                        color="red"
                        onClick={() => {
                          dbDeleteExpense({
                            expenseId: expense.id,
                            tripId: trip.id,
                          })
                            .then(() => {
                              publishToast({
                                root: {},
                                title: {
                                  children: `Deleted expense: ${expense.title}`,
                                },
                                close: {},
                              });
                            })
                            .catch((error: unknown) => {
                              console.error(
                                `Error deleting expense "${expense.title}"`,
                                error
                              );
                              publishToast({
                                root: {},
                                title: {
                                  children: `Error deleting expense: ${expense.title}`,
                                },
                                close: {},
                              });
                            });
                        }}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Popover.Content>
                </Popover.Root>
              </Table.Cell>
            </Table.Row>
          ))}

          {expenseMode === ExpenseMode.View ? (
            <Table.Row key={'add'}>
              <Table.Cell colSpan={8} align="center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExpenseMode(ExpenseMode.Edit);
                  }}
                >
                  <PlusIcon />
                  Add Expense
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : (
            <Table.Row key={'add'}>
              <ExpenseInlineForm trip={trip} setExpenseMode={setExpenseMode} />
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      {isLoading ? 'Loading expenses' : error ? `Error: ${error.message}` : ''}
    </Section>
  );
}
