import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskListComponent } from '../task-list/task-list.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule, FormsModule ,TaskListComponent],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.css'
})
export class CreateTaskComponent {
  taskName: string = '';

  constructor(private http:HttpClient , private router:Router){}


  createTask(){
    if (!this.taskName || this.taskName.trim() === '') {
      // Optionally, show a warning message to the user
      console.warn('Task name is empty, task creation skipped.');
      return; // Exit the function if the task name is empty
    }
    this.http.post('http://localhost:3000/task-creator/create-task',{name:this.taskName}).
    subscribe(res=>{
      console.log('task created',res)
      this.taskName=''
      console.log("haii" ,res)
      this.router.navigate(['/tasks']);
    })

  }


  tasks: any[] = [];



}
