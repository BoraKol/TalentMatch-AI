import { jobService } from '../../src/services/job.service';
import Job from '../../src/models/job.model';

// Mock the Job model
jest.mock('../../src/models/job.model');

describe('JobService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createJob', () => {
        it('should create a new job successfully', async () => {
            const jobData = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'Remote',
                salaryRange: '100k-120k',
                employmentType: 'Full-time',
                requiredSkills: ['Node.js', 'React'],
                experienceRequired: 3
            };
            const userId = 'user123';

            const mockJob = { ...jobData, _id: 'job123', postedBy: userId, isActive: true };
            (Job.create as jest.Mock).mockResolvedValue(mockJob);

            const result = await jobService.createJob(jobData, userId);

            expect(Job.create).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Software Engineer',
                postedBy: userId,
                isActive: true
            }));
            expect(result).toEqual(mockJob);
        });
    });

    describe('getAllJobs', () => {
        it('should return all active jobs sorted by date', async () => {
            const mockJobs = [
                { title: 'Job A', createdAt: new Date() },
                { title: 'Job B', createdAt: new Date() }
            ];

            const mockSort = jest.fn().mockResolvedValue(mockJobs);
            (Job.find as jest.Mock).mockReturnValue({ sort: mockSort });

            const result = await jobService.getAllJobs();

            expect(Job.find).toHaveBeenCalledWith({ isActive: true });
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(result).toEqual(mockJobs);
        });
    });

    describe('getJobById', () => {
        it('should return job if found', async () => {
            const mockJob = { _id: 'job123', title: 'Software Engineer' };
            (Job.findById as jest.Mock).mockResolvedValue(mockJob);

            const result = await jobService.getJobById('job123');

            expect(Job.findById).toHaveBeenCalledWith('job123');
            expect(result).toEqual(mockJob);
        });

        it('should throw error if job not found', async () => {
            (Job.findById as jest.Mock).mockResolvedValue(null);

            await expect(jobService.getJobById('invalidId'))
                .rejects
                .toThrow('Job not found');
        });
    });

    describe('updateJob', () => {
        it('should update job successfully', async () => {
            const updateData = { title: 'Updated Title' };
            const mockUpdatedJob = { _id: 'job123', ...updateData };

            (Job.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedJob);

            const result = await jobService.updateJob('job123', updateData);

            expect(Job.findByIdAndUpdate).toHaveBeenCalledWith(
                'job123',
                updateData,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedJob);
        });

        it('should throw error if job to update not found', async () => {
            (Job.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(jobService.updateJob('invalidId', {}))
                .rejects
                .toThrow('Job not found');
        });
    });

    describe('deleteJob', () => {
        it('should soft delete job successfully', async () => {
            const mockDeletedJob = { _id: 'job123', isActive: false };
            (Job.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockDeletedJob);

            const result = await jobService.deleteJob('job123');

            expect(Job.findByIdAndUpdate).toHaveBeenCalledWith(
                'job123',
                { isActive: false },
                { new: true }
            );
            expect(result).toEqual({ message: 'Job deleted successfully' });
        });

        it('should throw error if job to delete not found', async () => {
            (Job.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

            await expect(jobService.deleteJob('invalidId'))
                .rejects
                .toThrow('Job not found');
        });
    });
});
