import {
  Button,
  Section,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes';
import { db } from '../data/db';
import { DbTripWithActivityAccommodation } from '../Trip/db';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useCallback, useId, useMemo, useState } from 'react';
import { ExpenseMode } from './ExpenseMode';
import {
  formatTimestampToReadableDate,
  formatToDateInput,
  getDateTimeFromDateInput,
} from './time';
import { DateTime } from 'luxon';
import { useBoundStore } from '../data/store';
import { dbAddExpense, dbDeleteExpense } from './db';

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

  const tripStartStr = formatToDateInput(
    DateTime.fromMillis(trip.timestampStart).setZone(trip.timeZone)
  );
  const publishToast = useBoundStore((state) => state.publishToast);

  const [expenseMode, setExpenseMode] = useState(ExpenseMode.View);
  const idTimestampIncurred = useId();
  const idTitle = useId();
  const idDescription = useId();
  const idCurrency = useId();
  const idAmount = useId();
  const idCurrencyConversionFactor = useId();
  const idAmountInOriginCurrency = useId();
  const idAddForm = useId();
  const [errorMessage, setErrorMessage] = useState('');
  const currencies = useMemo(() => Intl.supportedValuesOf('currency'), []);

  const handleForm = useCallback(() => {
    return async (elForm: HTMLFormElement) => {
      setErrorMessage('');
      if (!elForm.reportValidity()) {
        return;
      }
      const formData = new FormData(elForm);

      const timestampIncurred =
        (formData.get('timestampIncurred') as string | null) ?? '';

      const title = (formData.get('title') as string | null) ?? '';

      const description = (formData.get('description') as string | null) ?? '';

      const currency = (formData.get('currency') as string | null) ?? '';

      const amountStr = (formData.get('amount') as string | null) ?? '';

      const currencyConversionFactorStr =
        (formData.get('currencyConversionFactor') as string | null) ?? '';

      const amountInOriginCurrencyStr =
        (formData.get('amountInOriginCurrency') as string | null) ?? '';
      const amount = parseFloat(amountStr);
      const currencyConversionFactor = parseFloat(currencyConversionFactorStr);
      const amountInOriginCurrency = parseFloat(amountInOriginCurrencyStr);

      const dateTimestampIncurred = getDateTimeFromDateInput(
        timestampIncurred,
        trip.timeZone
      );
      console.log('ExpenseAddForm', {
        timestampIncurred,
        title,
        description,
        currency,
        amountStr,
        amount,
        currencyConversionFactorStr,
        currencyConversionFactor,
        amountInOriginCurrencyStr,
        amountInOriginCurrency,
        dateTimestampIncurred,
      });
      if (
        !timestampIncurred ||
        !title ||
        !description ||
        !currency ||
        isNaN(amount)
      ) {
        return;
      }
      await dbAddExpense(
        {
          title,
          description,
          currency,
          amount,
          currencyConversionFactor,
          amountInOriginCurrency,
          timestampIncurred: dateTimestampIncurred.toMillis(),
        },
        { tripId: trip.id }
      );
      publishToast({
        root: {},
        title: { children: `Added expense: ${title}` },
        close: {},
      });
      elForm.reset();
    };
  }, [publishToast, trip.id, trip.timeZone]);

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
              Amount in Origin's Currency ({trip.originCurrency})
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {expenses.map((expense) => {
            return (
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
                  {/* <Button variant='outline'>
                    <Pencil1Icon />
                  </Button> */}
                  <Button
                    variant="outline"
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
                    <TrashIcon />
                  </Button>
                </Table.Cell>
              </Table.Row>
            );
          })}

          {expenseMode === ExpenseMode.View ? (
            <Table.Row key={'add'}>
              {' '}
              <Table.Cell colSpan={8} align="center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExpenseMode(ExpenseMode.Edit);
                  }}
                >
                  <PlusIcon />
                  Add Expense Mode
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : (
            <>
              <Table.Row key={'add'}>
                <Table.Cell>
                  <TextField.Root
                    id={idTimestampIncurred}
                    name="timestampIncurred"
                    type="date"
                    defaultValue={tripStartStr}
                    required
                    form={idAddForm}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root
                    id={idTitle}
                    name="title"
                    type="text"
                    required
                    form={idAddForm}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root
                    id={idDescription}
                    name="description"
                    type="text"
                    required
                    form={idAddForm}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Select.Root
                    name="currency"
                    defaultValue={trip.currency}
                    form={idAddForm}
                    required
                  >
                    <Select.Trigger id={idCurrency} />
                    <Select.Content>
                      {currencies.map((currency) => {
                        return (
                          <Select.Item key={currency} value={currency}>
                            {currency}
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select.Root>
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root
                    id={idAmount}
                    name="amount"
                    type="number"
                    required
                    form={idAddForm}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root
                    id={idCurrencyConversionFactor}
                    name="currencyConversionFactor"
                    type="number"
                    defaultValue={1}
                    required
                    form={idAddForm}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextField.Root
                    id={idAmountInOriginCurrency}
                    name="amountInOriginCurrency"
                    type="number"
                    required
                    form={idAddForm}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button
                    type="submit"
                    size="2"
                    variant="solid"
                    form={idAddForm}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="2"
                    variant="soft"
                    color="gray"
                    form={idAddForm}
                    onClick={() => {
                      setExpenseMode(ExpenseMode.View);
                    }}
                  >
                    Back
                  </Button>
                </Table.Cell>
              </Table.Row>
            </>
          )}
        </Table.Body>
      </Table.Root>
      <form
        id={idAddForm}
        onInput={() => {
          setErrorMessage('');
        }}
        onSubmit={(e) => {
          e.preventDefault();
          const elForm = e.currentTarget;
          void handleForm()(elForm);
        }}
      >
        <Text color="red" size="2">
          {errorMessage}
        </Text>
      </form>
      {isLoading ? 'Loading expenses' : error ? `Error: ${error.message}` : ''}
    </Section>
  );
}
