//general
import { View, type ViewProps } from 'react-native';

//theme
import { Colors } from '@/components/theme/Colors';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = Colors.dark.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
