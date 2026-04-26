/**
 * Simple statistical prediction methods
 * No external dependencies - pure TypeScript implementation
 */

export interface DataPoint {
  value: number
  timestamp: Date
}

export interface PredictionResult {
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'neutral'
  method: string
}

/**
 * Simple Moving Average
 * Calculates average of last N data points
 */
export function movingAverage(data: number[], window: number): number {
  if (data.length === 0) return 0
  if (data.length < window) window = data.length
  
  const slice = data.slice(-window)
  return slice.reduce((sum, val) => sum + val, 0) / window
}

/**
 * Linear Regression
 * Fits a line y = mx + b to predict next value
 */
export function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  if (data.length < 2) {
    return { slope: 0, intercept: data[0] || 0, r2: 0 }
  }

  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const y = data

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // R-squared for confidence
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - sumY / n, 2), 0)
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = slope * i + intercept
    return sum + Math.pow(yi - predicted, 2)
  }, 0)
  const r2 = ssTotal === 0 ? 0 : 1 - ssRes / ssTotal

  return { slope, intercept, r2 }
}

/**
 * Exponential Smoothing
 * Gives more weight to recent data
 */
export function exponentialSmoothing(data: number[], alpha: number = 0.3): number {
  if (data.length === 0) return 0
  if (data.length === 1) return data[0]

  let smoothed = data[0]
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed
  }
  return smoothed
}

/**
 * Predict next value using multiple methods and average
 */
export function predictNext(data: number[], method: 'ma' | 'lr' | 'es' | 'ensemble' = 'ensemble'): PredictionResult {
  if (data.length < 2) {
    return {
      predicted: data[0] || 0,
      confidence: 0,
      trend: 'neutral',
      method: 'insufficient-data'
    }
  }

  const lastValue = data[data.length - 1]
  const ma3 = movingAverage(data, 3)
  const lr = linearRegression(data)
  const es = exponentialSmoothing(data, 0.3)

  let predicted: number
  let confidence: number

  switch (method) {
    case 'ma':
      predicted = ma3
      confidence = Math.min(90, 50 + data.length * 5)
      break
    case 'lr':
      predicted = lr.slope * data.length + lr.intercept
      confidence = Math.min(95, 60 + lr.r2 * 30)
      break
    case 'es':
      predicted = es
      confidence = Math.min(85, 50 + data.length * 4)
      break
    case 'ensemble':
    default:
      // Weighted average of methods
      const maWeight = 0.3
      const lrWeight = 0.4
      const esWeight = 0.3
      predicted = ma3 * maWeight + (lr.slope * data.length + lr.intercept) * lrWeight + es * esWeight
      confidence = Math.min(90, 55 + data.length * 4 + lr.r2 * 20)
      break
  }

  // Determine trend
  const trend: 'up' | 'down' | 'neutral' = 
    predicted > lastValue * 1.05 ? 'up' :
    predicted < lastValue * 0.95 ? 'down' : 'neutral'

  return {
    predicted: Math.round(predicted),
    confidence: Math.round(confidence),
    trend,
    method
  }
}

/**
 * Calculate growth rate between periods
 */
export function growthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Calculate average growth rate over multiple periods
 */
export function averageGrowthRate(data: number[]): number {
  if (data.length < 2) return 0
  
  const rates: number[] = []
  for (let i = 1; i < data.length; i++) {
    rates.push(growthRate(data[i], data[i - 1]))
  }
  
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length
}
