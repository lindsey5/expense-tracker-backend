import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('HTTP');

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const status =
        exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
        exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error';

        const message =
        typeof exceptionResponse === 'string'
            ? exceptionResponse
            : JSON.stringify(exceptionResponse);

        this.logger.error(
            `${request.method} ${request.url} ${status} - ${message}`,
            exception instanceof Error ? exception.stack : undefined,
        );

        response.status(status).json({
            statusCode: status,
            message:
                exception instanceof HttpException
                ? exceptionResponse
                : 'Internal server error',
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}