import { IsEnum, IsOptional, IsString, IsNumberString, IsDateString } from 'class-validator';
import { LoanType } from '../../common/enums/loan-type.enum';
import { RecordStatus } from '../../common/enums/status.enum';

export class QueryRecordDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(LoanType)
  loanType?: LoanType;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
