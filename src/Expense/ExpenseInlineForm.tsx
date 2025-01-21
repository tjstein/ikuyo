import { Button, Select, Table, TextField, Text } from '@radix-ui/themes';
import { ExpenseMode } from './ExpenseMode';
import { useState, useMemo, useCallback, useId } from 'react';
import { dbAddExpense } from './db';
import { formatToDateInput, getDateTimeFromDateInput } from './time';
import { DbTripWithActivityAccommodation } from '../Trip/db';
import { DateTime } from 'luxon';
import { useBoundStore } from '../data/store';
export function ExpenseInlineForm({
  trip,
  setExpenseMode,
}: {
  trip: DbTripWithActivityAccommodation;
  setExpenseMode: (mode: ExpenseMode) => void;
}) {
  const tripStartStr = useMemo(
    () =>
      formatToDateInput(
        DateTime.fromMillis(trip.timestampStart).setZone(trip.timeZone)
      ),
    [trip.timestampStart, trip.timeZone]
  );
  const publishToast = useBoundStore((state) => state.publishToast);
  const idForm = useId();
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
    (e: React.FormEvent<HTMLFormElement>) => {
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

      dbAddExpense(
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
      )
        .then(() => {
          publishToast({
            root: {},
            title: { children: `Added expense: ${title}` },
            close: {},
          });

          resetFormState();
        })
        .catch((error: unknown) => {
          console.error(`Error adding expense "${title}"`, error);
          publishToast({
            root: {},
            title: { children: `Error adding expense: ${title}` },
            close: {},
          });
        });
    },
    [formState, publishToast, trip.id, trip.timeZone, resetFormState]
  );

  const handleCurrencyChange = useCallback((value: string) => {
    setFormState((prev) => ({ ...prev, currency: value }));
  }, []);

  const fieldTimestampIncurred = useMemo(
    () => (
      <TextField.Root
        name="timestampIncurred"
        type="date"
        value={formState.timestampIncurred}
        onChange={handleInputChange}
        required
        form={idForm}
      />
    ),
    [formState.timestampIncurred, handleInputChange, idForm]
  );
  const fieldSelectCurrency = useMemo(() => {
    return (
      <Select.Root
        name="currency"
        value={formState.currency}
        onValueChange={handleCurrencyChange}
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
    );
  }, [currencies, formState.currency, handleCurrencyChange, idForm]);

  const handleFocusAmount = useCallback(() => {
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
          amountInOriginCurrencyFloat * currencyConversionFactorFloat
        ).toFixed(2),
      }));
    }
  }, [
    formState.amount,
    formState.amountInOriginCurrency,
    formState.currencyConversionFactor,
  ]);
  const handleFocusCurrencyConversionFactor = useCallback(() => {
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
  }, [
    formState.amount,
    formState.amountInOriginCurrency,
    formState.currencyConversionFactor,
  ]);
  const handleFocusAmountInOriginCurrency = useCallback(() => {
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
  }, [
    formState.amount,
    formState.amountInOriginCurrency,
    formState.currencyConversionFactor,
  ]);
  // TODO: sticky header
  // TODO: the UX for new entry is not good, there is a "blank" phase before user sees it... maybe need our own zustand store to make it optimistic

  const fieldAmount = useMemo(() => {
    return (
      <TextField.Root
        name="amount"
        type="number"
        value={formState.amount}
        onChange={handleInputChange}
        form={idForm}
        onFocus={handleFocusAmount}
        required
      />
    );
  }, [formState.amount, handleFocusAmount, handleInputChange, idForm]);

  const fieldCurrencyConversionFactor = useMemo(() => {
    return (
      <TextField.Root
        name="currencyConversionFactor"
        type="number"
        value={formState.currencyConversionFactor}
        onChange={handleInputChange}
        form={idForm}
        onFocus={handleFocusCurrencyConversionFactor}
        required
      />
    );
  }, [
    formState.currencyConversionFactor,
    handleFocusCurrencyConversionFactor,
    handleInputChange,
    idForm,
  ]);

  const fieldAmountInOriginCurrency = useMemo(() => {
    return (
      <TextField.Root
        name="amountInOriginCurrency"
        type="number"
        value={formState.amountInOriginCurrency}
        onChange={handleInputChange}
        form={idForm}
        onFocus={handleFocusAmountInOriginCurrency}
        required
      />
    );
  }, [
    formState.amountInOriginCurrency,
    handleFocusAmountInOriginCurrency,
    handleInputChange,
    idForm,
  ]);

  const handleOnBack = useCallback(() => {
    setExpenseMode(ExpenseMode.View);
    resetFormState();
  }, [resetFormState, setExpenseMode]);

  const handleFormInput = useCallback(() => {
    setErrorMessage('');
  }, []);

  return (
    <>
      <Table.Cell>{fieldTimestampIncurred}</Table.Cell>
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
      <Table.Cell>{fieldSelectCurrency}</Table.Cell>
      <Table.Cell>{fieldAmount}</Table.Cell>
      <Table.Cell>{fieldCurrencyConversionFactor}</Table.Cell>
      <Table.Cell>{fieldAmountInOriginCurrency}</Table.Cell>
      <Table.Cell style={{ whiteSpace: 'nowrap' }}>
        <Button mr="2"
          mb="2"  type="submit" size="2" variant="solid" form={idForm}>
          Add
        </Button>
        <Button
          type="button"
          size="2"
          variant="soft"
          color="gray"
          form={idForm}
          onClick={handleOnBack}
        >
          Back
        </Button>
        <form id={idForm} onInput={handleFormInput} onSubmit={handleForm}>
          <Text color="red" size="2">
            {errorMessage}
          </Text>
        </form>
      </Table.Cell>
    </>
  );
}
