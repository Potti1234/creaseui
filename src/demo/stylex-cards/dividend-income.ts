import type { Html, HtmlBuilder } from "foldkit/html";
import * as stylex from "@stylexjs/stylex";

import * as Icon from "@/demo/icon-preview";
import { button } from "@/stylex/button";
import {
  card,
  cardAction,
  cardContent,
  cardDescription,
  cardHeader,
  cardTitle,
} from "@/stylex/card";
import { barChart } from "@/stylex/chart";
import {
  item,
  itemContent,
  itemDescription,
  itemGroup,
  itemTitle,
} from "@/stylex/item";
import { className } from "@/stylex/style";

const styles = stylex.create({
  visuallyHidden: {
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    clipPath: "inset(50%)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
  chart: {
    display: { default: "none", "@media (min-width: 768px)": "block" },
    height: "2rem",
    width: "6rem",
  },
  amount: {
    display: { default: "none", "@media (min-width: 768px)": "block" },
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
});

const holdings = [
  {
    name: "Vanguard VIG",
    shares: "450 Shares",
    amount: "$1,842.10",
    data: [
      { label: "Q1", value: 380 },
      { label: "Q2", value: 420 },
      { label: "Q3", value: 390 },
      { label: "Q4", value: 652 },
    ],
  },
  {
    name: "S&P 500 VOO",
    shares: "112 Shares",
    amount: "$928.40",
    data: [
      { label: "Q1", value: 180 },
      { label: "Q2", value: 210 },
      { label: "Q3", value: 320 },
      { label: "Q4", value: 218 },
    ],
  },
  {
    name: "Apple AAPL",
    shares: "85 Shares",
    amount: "$340.00",
    data: [
      { label: "Q1", value: 60 },
      { label: "Q2", value: 70 },
      { label: "Q3", value: 120 },
      { label: "Q4", value: 90 },
    ],
  },
  {
    name: "Realty Income",
    shares: "320 Shares",
    amount: "$1,139.50",
    data: [
      { label: "Q1", value: 240 },
      { label: "Q2", value: 260 },
      { label: "Q3", value: 280 },
      { label: "Q4", value: 360 },
    ],
  },
];

export const view = <Msg>(h: HtmlBuilder<Msg>): Html => {
  return card(
    {
      children: [
        cardHeader(
          {
            children: [
              cardTitle({ children: ["Q2 Dividend Income"] }, h),
              cardDescription(
                {
                  children: [
                    "Quarterly dividend payouts across your portfolio holdings.",
                  ],
                },
                h,
              ),
              cardAction(
                {
                  children: [
                    button(
                      {
                        variant: "secondary",
                        size: "icon",
                        children: [
                          Icon.icon("x", {}, h),
                          h.span(
                            [h.Class(className(styles.visuallyHidden))],
                            ["Close dividend income summary"],
                          ),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
        cardContent(
          {
            children: [
              itemGroup(
                {
                  spacing: "md",
                  children: holdings.map((holding) =>
                    item(
                      {
                        variant: "muted",
                        children: [
                          itemContent(
                            {
                              children: [
                                itemTitle({ children: [holding.name] }, h),
                                itemDescription(
                                  { children: [holding.shares] },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          h.div(
                            [h.Class(className(styles.chart))],
                            [
                              barChart(
                                {
                                  data: holding.data,
                                  showXAxisLabels: false,
                                },
                                h,
                              ),
                            ],
                          ),
                          h.span(
                            [h.Class(className(styles.amount))],
                            [holding.amount],
                          ),
                        ],
                      },
                      h,
                    ),
                  ),
                },
                h,
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );
};

// Stateful: no. Submodels: none. PORT NOTE: Recharts mini charts use @/stylex/chart barChart; icon-sm is matched with a size-8 class.
