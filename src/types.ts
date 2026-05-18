/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Basket {
  id: string;
  weight: number;
}

export interface RubberSale {
  id: string;
  yardName: string;
  pricePerKg: number;
  dateTime: string;
  baskets: Basket[];
  totalWeight: number;
  totalAmount: number;
  createdAt: number;
}

export type TabType = 'entry' | 'summary';
