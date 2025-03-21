/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Button, Group, NumberInput, Stack, Title } from '@mantine/core';
import { RunnerConfig } from '../types/runner';
import { useForm } from '@mantine/form';
import { IconRun } from '@tabler/icons-react';

type RunnerConfigFormProps = {
  startRun: (config: any) => void;
};

export const RunnerConfigForm: React.FC<RunnerConfigFormProps> = ({ startRun }) => {
  const configForm = useForm<RunnerConfig>({
    name: 'runner-form',
    mode: 'uncontrolled',
    initialValues: {
      recursive: false,
      delay: 0,
      path: null
    }
  });

  return (
    <form
      onSubmit={configForm.onSubmit((values) => {
        startRun(values);
      })}
      onReset={configForm.onReset}
    >
      <Stack>
        <Title order={2}>Configure runner</Title>

        <NumberInput
          {...configForm.getInputProps('delay')}
          label={'Delay between requests'}
          description={'In milliseconds'}
          allowDecimal={false}
          min={0}
          step={100}
          thousandSeparator={','}
          defaultValue={0}
        />

        <Group w={'100%'}>
          <Button type="submit" variant="filled" leftSection={<IconRun />}>
            Run collection
          </Button>

          <Button type="reset" variant="subtle" color="red">
            Reset
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
