import { Routes } from '@angular/router';
import { CreateTaskComponent } from './component/create-task/create-task.component';
import { TaskListComponent } from './component/task-list/task-list.component';

export const routes: Routes = [

    {path : '' , component:CreateTaskComponent},
    {path : 'tasks' , component:TaskListComponent},
];
