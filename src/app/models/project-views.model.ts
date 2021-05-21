import { User } from './user.model';
import { Job } from 'src/app/models/job.model';
export class ProjectViewsModel {
  constructor (init? : ProjectViewsModel) {
    Object.assign(this, init);
  }

  job: number | Job;
  viewer: number | User;
  
}