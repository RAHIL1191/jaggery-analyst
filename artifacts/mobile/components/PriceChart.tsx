import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PricePoint } from "@/constants/marketData";
import { useColors } from "@/hooks/useColors";

type Props = {
  data: PricePoint[];
  height?: number;
};

export function PriceChart({ data, height = 140 }: Props) {
  const colors = useColors();

  const { normalizedPrices, minPrice, maxPrice, change } = useMemo(() => {
    const prices = data.map((d) => d.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const normalized = prices.map((p) => ((p - minP) / range));
    const ch = prices[prices.length - 1] - prices[0];
    return { normalizedPrices: normalized, minPrice: minP, maxPrice: maxP, change: ch };
  }, [data]);

  const isPositive = change >= 0;
  const lineColor = isPositive ? colors.buy : colors.sell;

  const chartWidth = 320;
  const chartHeight = height;
  const step = chartWidth / (normalizedPrices.length - 1);

  const pathPoints = normalizedPrices.map((v, i) => {
    const x = i * step;
    const y = chartHeight - v * chartHeight;
    return { x, y };
  });

  return (
    <View style={[styles.container, { height: chartHeight + 40 }]}>
      <View style={[styles.chart, { height: chartHeight }]}>
        {pathPoints.map((point, i) => {
          if (i === 0) return null;
          const prev = pathPoints[i - 1];
          const dx = point.x - prev.x;
          const dy = point.y - prev.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          return (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  width: len,
                  left: prev.x,
                  top: prev.y - 1,
                  transform: [{ rotateZ: `${angle}deg` }],
                  backgroundColor: lineColor,
                },
              ]}
            />
          );
        })}
        {pathPoints.length > 0 && (
          <View
            style={[
              styles.dot,
              {
                left: pathPoints[pathPoints.length - 1].x - 4,
                top: pathPoints[pathPoints.length - 1].y - 4,
                backgroundColor: lineColor,
              },
            ]}
          />
        )}
        <View style={[styles.gridLine, { bottom: 0, borderColor: colors.border }]} />
        <View style={[styles.gridLine, { bottom: chartHeight / 2, borderColor: colors.border }]} />
      </View>

      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          ₹{minPrice.toLocaleString("en-IN")}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          30 days
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          ₹{maxPrice.toLocaleString("en-IN")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 4,
  },
  chart: {
    width: "100%",
    position: "relative",
  },
  segment: {
    position: "absolute",
    height: 2,
    transformOrigin: "0 1px",
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  label: {
    fontSize: 11,
  },
});
