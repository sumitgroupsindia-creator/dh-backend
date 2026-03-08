import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LoanType } from '../../common/enums/loan-type.enum';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(LoanType)
  loanType: LoanType;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  loanAmount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
