// components/SemiCircleProgress.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

//theme
import { Colors } from "@/components/theme/Colors";

type Props = {
  steps: number;
  max: number;
  markers?: number[];
};

export const StepsProgress: React.FC<Props> = ({
  steps,
  max,
  markers = [3000, 6000, 9000, 12000],
}) => {
    steps = 6000
  const radius = 125;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const progress = Math.min((Math.max(steps,1)) / max, 1) * circumference;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Svg width={radius * 2 + strokeWidth} height={radius + strokeWidth / 2}>
            <Circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke={Colors.dark.borderGray}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${Math.PI * radius} ${Math.PI * radius}`} // half-circle
              strokeDashoffset={0} // start from left
              rotation="-180"
              originX={radius + strokeWidth / 2}
              originY={radius + strokeWidth / 2}
            />
          
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke={Colors.light.purple}
            strokeWidth={strokeWidth}
            strokeDasharray={`${Math.PI * radius} ${Math.PI * radius}`} // half-circle
            strokeDashoffset={circumference - progress}
            fill="none"
            strokeLinecap="round"
            rotation="-180"
            originX={radius + strokeWidth / 2}
            originY={radius + strokeWidth / 2}
          />
          </Svg>
          
          {/* step number in center */}
               <Text
                 style={{
                   position: "absolute",
                   top: radius / 2.5,
                   fontSize: 18,
                   fontWeight: "600",
                   color: "white",
                 }}
               >
                 {steps.toLocaleString()}
               </Text>
          
    </View>
  );
};
