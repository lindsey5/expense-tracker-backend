import { jest } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { DateFilter } from './common.dto';

describe('DateFilter', () => {
  it('defaults to the current month and year', () => {
    const nowSpy = jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(8);
    const yearSpy = jest
      .spyOn(Date.prototype, 'getFullYear')
      .mockReturnValue(2026);

    expect(new DateFilter()).toEqual({
      month: 9,
      year: 2026,
    });

    nowSpy.mockRestore();
    yearSpy.mockRestore();
  });

  it('transforms month and year query values to numbers', () => {
    const dateFilter = plainToInstance(DateFilter, {
      month: '9',
      year: '2026',
    });

    expect(dateFilter).toEqual({
      month: 9,
      year: 2026,
    });
  });
});
