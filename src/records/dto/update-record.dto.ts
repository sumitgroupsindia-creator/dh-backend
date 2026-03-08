import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LoanType } from '../../common/enums/loan-type.enum';
import { RecordStatus } from '../../common/enums/status.enum';

export class UpdateRecordDto {
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(LoanType)
  @IsOptional()
  loanType?: LoanType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  loanAmount?: number;

  @IsEnum(RecordStatus)
  @IsOptional()
  status?: RecordStatus;
}
