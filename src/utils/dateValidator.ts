import { createCustomError, HttpCode } from "../errors/customError";

export const validateDate = (dateString: string, fieldName: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw createCustomError(
      `Invalid ${fieldName} format`,
      HttpCode.BAD_REQUEST
    );
  }
  return date;
};

export const validateFutureDate = (date: Date, fieldName: string): void => {
  if (date < new Date()) {
    throw createCustomError(
      `${fieldName} cannot be in the past`,
      HttpCode.BAD_REQUEST
    );
  }
};

export const validateDateRange = (
  startDate: Date,
  endDate?: Date | null
): void => {
  if (endDate && startDate >= endDate) {
    throw createCustomError(
      "End date must be after start date",
      HttpCode.BAD_REQUEST
    );
  }
};
