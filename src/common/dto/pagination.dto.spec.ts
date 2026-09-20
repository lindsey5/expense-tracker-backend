import { PaginationDto, PaginationResponseDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('defaults to the first page with ten records per page', () => {
    expect(new PaginationDto()).toEqual({
      page: 1,
      limit: 10,
    });
  });

  it('allows pagination response properties to be assigned', () => {
    const response = new PaginationResponseDto();

    response.page = 2;
    response.limit = 25;
    response.totalPages = 4;
    response.total = 100;

    expect(response).toEqual({
      page: 2,
      limit: 25,
      totalPages: 4,
      total: 100,
    });
  });
});
