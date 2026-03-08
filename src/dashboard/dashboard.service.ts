import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record, RecordDocument } from '../records/schemas/record.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Record.name) private recordModel: Model<RecordDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getStats(user: any) {
    const filter: any = {};
    if (user.role === Role.TEAM_MEMBER) {
      filter.createdBy = user.id;
    }

    const [
      totalRecords,
      pendingRecords,
      approvedRecords,
      rejectedRecords,
      loanTypeDistribution,
      recentRecords,
      teamMembers,
      recordsByMember,
    ] = await Promise.all([
      this.recordModel.countDocuments(filter),
      this.recordModel.countDocuments({ ...filter, status: 'Pending' }),
      this.recordModel.countDocuments({ ...filter, status: 'Approved' }),
      this.recordModel.countDocuments({ ...filter, status: 'Rejected' }),
      this.recordModel.aggregate([
        { $match: filter },
        { $group: { _id: '$loanType', count: { $sum: 1 }, totalAmount: { $sum: '$loanAmount' } } },
      ]),
      this.recordModel
        .find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      user.role === Role.ADMIN ? this.userModel.countDocuments({ role: Role.TEAM_MEMBER }) : 0,
      user.role === Role.ADMIN
        ? this.recordModel.aggregate([
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $group: {
                _id: '$createdBy',
                name: { $first: '$user.name' },
                count: { $sum: 1 },
                totalAmount: { $sum: '$loanAmount' },
              },
            },
            { $sort: { count: -1 } },
          ])
        : [],
    ]);

    return {
      totalRecords,
      pendingRecords,
      approvedRecords,
      rejectedRecords,
      loanTypeDistribution,
      recentRecords,
      teamMembers,
      recordsByMember,
    };
  }
}
