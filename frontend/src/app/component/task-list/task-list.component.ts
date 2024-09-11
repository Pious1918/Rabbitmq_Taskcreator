import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [FormsModule , CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit{

  
  tasks: any[] = [];
  private socket!:WebSocket;
  constructor(private http : HttpClient , private router:Router){}

  ngOnInit(): void {
    this.fetchTasks()
  
  }

  fetchTasks(){
    this.http.get('http://localhost:3000/task-processing/tasks').
    subscribe((res:any)=>{
      console.log("response is",res)
      this.tasks =res
    })
  }


  deleteTask(taskId: string) {
    this.http.delete(`http://localhost:3000/task-processing/deletetask/${taskId}`)
        .subscribe((res:any) => {
            console.log("Delete request sent",res.tasks);
          
            this.tasks = res.tasks
         
        }, (error) => {
            console.error("Error sending delete request", error);
        });
}


}
