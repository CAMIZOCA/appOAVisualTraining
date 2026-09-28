import { StyleSheet, View } from 'react-native';

import type { ParamField, ParamValues } from '@/activities/core/types';
import { AppText, Divider, SegmentedControl, Stepper, ToggleRow } from '@/components/ui';
import { useT } from '@/i18n';
import { spacing } from '@/theme';

interface ParamFormProps {
  fields: ParamField[];
  values: ParamValues;
  onChange: (values: ParamValues) => void;
}

function formatNumber(value: number, unit?: string) {
  if (unit === 's') return `${value} s`;
  if (unit === 'ms') return `${value} ms`;
  if (unit === '%') return `${value} %`;
  if (unit === 'px') return `${value} px`;
  return unit ? `${value} ${unit}` : String(value);
}

/** Generic form rendered from an activity's parameter schema (Player options, Lab, Dev mode). */
export function ParamForm({ fields, values, onChange }: ParamFormProps) {
  const { l } = useT();
  const set = (key: string, value: ParamValues[string]) => onChange({ ...values, [key]: value });

  return (
    <View>
      {fields.map((field, index) => {
        const label = l(field.label);
        const help = field.help ? l(field.help) : undefined;
        let control: React.ReactNode;
        if (field.type === 'boolean') {
          control = (
            <ToggleRow
              label={label}
              description={help}
              value={values[field.key] === true}
              onValueChange={(v) => set(field.key, v)}
            />
          );
        } else {
          control = (
            <View style={styles.field}>
              <AppText variant="bodyStrong">{label}</AppText>
              {help ? (
                <AppText variant="small" muted>
                  {help}
                </AppText>
              ) : null}
              {field.type === 'enum' ? (
                <SegmentedControl
                  accessibilityLabel={label}
                  value={values[field.key] as string | number}
                  onChange={(v) => set(field.key, v)}
                  options={field.options.map((o) => ({ value: o.value, label: l(o.label) }))}
                />
              ) : (
                <Stepper
                  accessibilityLabel={label}
                  value={values[field.key] as number}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onChange={(v) => set(field.key, v)}
                  format={(v) => formatNumber(v, field.unit)}
                />
              )}
            </View>
          );
        }
        return (
          <View key={field.key}>
            {index > 0 ? <Divider /> : null}
            {control}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm, paddingVertical: spacing.md },
});
