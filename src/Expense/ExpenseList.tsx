import React, { useState, useCallback, useMemo, useId } from 'react';
import {
  Button,
  Flex,
  Popover,
  Section,
  Select,
  Table,
  Text,
  TextField,
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

  const idForm = useId();

  const expenses = data?.expense ?? [];

  const tripStartStr = formatToDateInput(
    DateTime.fromMillis(trip.timestampStart).setZone(trip.timeZone)
  );
  const publishToast = useBoundStore((state) => state.publishToast);

  const [expenseMode, setExpenseMode] = useState(ExpenseMode.View);
  const [formState, setFormState] = useState({
    timestampIncurred: tripStartStr,
    title: '',
    description: '',
    currency: trip.currency,
    amount: '',
    currencyConversionFactor: '1',
    amountInOriginCurrency: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const currencies = useMemo(() => Intl.supportedValuesOf('currency'), []);

  const resetFormState = useCallback(() => {
    setFormState({
      timestampIncurred: tripStartStr,
      title: '',
      description: '',
      currency: trip.currency,
      amount: '',
      currencyConversionFactor: '1',
      amountInOriginCurrency: '',
    });
  }, [trip.currency, tripStartStr]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormState((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );

  const handleForm = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage('');
      const {
        timestampIncurred,
        title,
        description,
        currency,
        amount,
        currencyConversionFactor,
        amountInOriginCurrency,
      } = formState;
      console.log('aaa');

      const dateTimestampIncurred = getDateTimeFromDateInput(
        timestampIncurred,
        trip.timeZone
      );
      const amountFloat = parseFloat(amount);
      const currencyConversionFactorFloat = parseFloat(
        currencyConversionFactor
      );
      const amountInOriginCurrencyFloat = parseFloat(amountInOriginCurrency);

      console.log({
        timestampIncurred,
        title,
        description,
        currency,
        amountFloat,
        currencyConversionFactorFloat,
        amountInOriginCurrencyFloat,
      });

      if (
        !timestampIncurred ||
        !title ||
        !description ||
        !currency ||
        isNaN(amountFloat)
      ) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }

      await dbAddExpense(
        {
          title,
          description,
          currency,
          amount: amountFloat,
          currencyConversionFactor: currencyConversionFactorFloat,
          amountInOriginCurrency: amountInOriginCurrencyFloat,
          timestampIncurred: dateTimestampIncurred.toMillis(),
        },
        { tripId: trip.id }
      );

      publishToast({
        root: {},
        title: { children: `Added expense: ${title}` },
        close: {},
      });

      resetFormState();
    },
    [formState, publishToast, trip.id, trip.timeZone, resetFormState]
  );

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
              <Tooltip
                content={`How much does 1 unit of Currency is worth in Origin's Currency. This is equal to Amount divided by Amount in Origin's Currency.`}
              >
                <QuestionMarkCircledIcon
                  style={{ verticalAlign: `-3px`, marginLeft: '3px' }}
                />
              </Tooltip>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              Amount in Origin's Currency ({trip.originCurrency})
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
                  Add Expense Mode
                </Button>
              </Table.Cell>
            </Table.Row>
          ) : (
            <Table.Row key={'add'}>
              <Table.Cell>
                <TextField.Root
                  name="timestampIncurred"
                  type="date"
                  value={formState.timestampIncurred}
                  onChange={handleInputChange}
                  required
                  form={idForm}
                />
              </Table.Cell>
              <Table.Cell>
                <TextField.Root
                  name="title"
                  type="text"
                  value={formState.title}
                  onChange={handleInputChange}
                  required
                  form={idForm}
                />
              </Table.Cell>
              <Table.Cell>
                <TextField.Root
                  name="description"
                  type="text"
                  value={formState.description}
                  onChange={handleInputChange}
                  required
                  form={idForm}
                />
              </Table.Cell>
              <Table.Cell>
                <Select.Root
                  name="currency"
                  value={formState.currency}
                  onValueChange={(value) => {
                    setFormState((prev) => ({ ...prev, currency: value }));
                  }}
                  required
                  form={idForm}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {currencies.map((currency) => (
                      <Select.Item key={currency} value={currency}>
                        {currency}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Table.Cell>
              <Table.Cell>
                <TextField.Root
                  name="amount"
                  type="number"
                  value={formState.amount}
                  onChange={handleInputChange}
                  form={idForm}
                  onFocus={() => {
                    // If the other two values are available & this is empty, then calculate it
                    if (
                      !formState.amount &&
                      formState.currencyConversionFactor &&
                      formState.amountInOriginCurrency
                    ) {
                      const amountInOriginCurrencyFloat = parseFloat(
                        formState.amountInOriginCurrency
                      );
                      const currencyConversionFactorFloat = parseFloat(
                        formState.currencyConversionFactor
                      );
                      setFormState((prev) => ({
                        ...prev,
                        amount: (
                          amountInOriginCurrencyFloat *
                          currencyConversionFactorFloat
                        ).toFixed(2),
                      }));
                    }
                  }}
                  required
                />
              </Table.Cell>
              <Table.Cell>
                <TextField.Root
                  name="currencyConversionFactor"
                  type="number"
                  value={formState.currencyConversionFactor}
                  onChange={handleInputChange}
                  form={idForm}
                  onFocus={() => {
                    // If the other two values are available & this is empty, then calculate it
                    if (
                      formState.amount &&
                      !formState.currencyConversionFactor &&
                      formState.amountInOriginCurrency
                    ) {
                      const amountFloat = parseFloat(formState.amount);
                      const amountInOriginCurrencyFloat = parseFloat(
                        formState.amountInOriginCurrency
                      );
                      setFormState((prev) => ({
                        ...prev,
                        currencyConversionFactor: (
                          amountFloat / amountInOriginCurrencyFloat
                        ).toFixed(2),
                      }));
                    }
                  }}
                  required
                />
              </Table.Cell>
              <Table.Cell>
                <TextField.Root
                  name="amountInOriginCurrency"
                  type="number"
                  value={formState.amountInOriginCurrency}
                  onChange={handleInputChange}
                  form={idForm}
                  onFocus={() => {
                    // If the other two values are available & this is empty, then calculate it
                    if (
                      formState.amount &&
                      formState.currencyConversionFactor &&
                      !formState.amountInOriginCurrency
                    ) {
                      const amountFloat = parseFloat(formState.amount);
                      const currencyConversionFactorFloat = parseFloat(
                        formState.currencyConversionFactor
                      );
                      setFormState((prev) => ({
                        ...prev,
                        amountInOriginCurrency: (
                          amountFloat / currencyConversionFactorFloat
                        ).toFixed(2),
                      }));
                    }
                  }}
                  required
                />
              </Table.Cell>
              <Table.Cell>
                <Button type="submit" size="2" variant="solid" form={idForm}>
                  Add
                </Button>
                <Button
                  type="button"
                  size="2"
                  variant="soft"
                  color="gray"
                  form={idForm}
                  onClick={() => {
                    setExpenseMode(ExpenseMode.View);
                    resetFormState();
                  }}
                >
                  Back
                </Button>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
      <form
        id={idForm}
        onInput={() => {
          setErrorMessage('');
        }}
        onSubmit={(e) => {
          void handleForm(e);
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
