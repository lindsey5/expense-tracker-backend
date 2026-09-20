import { jest } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import {
  GetTransactionsDto,
  GetTransactionsResponseDto,
} from './get-transaction.dto';

describe('GetTransactionsDto', () => {
  it('defaults pagination and date filters', () => {
    const monthSpy = jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(8);
    const yearSpy = jest
      .spyOn(Date.prototype, 'getFullYear')
      .mockReturnValue(2026);

    expect(new GetTransactionsDto()).toEqual({
      month: 9,
      year: 2026,
      page: 1,
      limit: 10,
    });

    monthSpy.mockRestore();
    yearSpy.mockRestore();
  });

  it('transforms numeric query parameters', () => {
    const dto = plainToInstance(GetTransactionsDto, {
      month: '9',
      year: '2026',
      page: '2',
      limit: '25',
    });

    expect(dto.month).toBe(9);
    expect(dto.year).toBe(2026);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(25);
  });

  it('allows response properties to be assigned', () => {
    const response = new GetTransactionsResponseDto();

    response.transactions = [];
    response.pagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };

    expect(response).toEqual({
      transactions: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  });
});
