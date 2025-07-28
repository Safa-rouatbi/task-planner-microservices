import { Component, OnInit } from '@angular/core';
import{FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm:FormGroup;
  errorMessage: string='';

  constructor(private fb: FormBuilder, private authService: AuthService, private router:Router){
    this.loginForm=this.fb.group({
      mail:['',[Validators.required,Validators.email]],
      motdepasse:['',[Validators.required, Validators.minLength(6)]]
    });
  }
  ngOnInit(): void {
  }

  onSubmit():void{
    if (this.loginForm.invalid){
      return
    }
    const { mail, motdepasse } = this.loginForm.value;

    this.authService.login({mail, motdepasse}).subscribe({
      next: (response: any)=>{
        const token= response.token;
        this.authService.saveToken(token);

        const role = this.authService.getUserRole();

         if (role === 'ADMIN') {
          this.router.navigate(['/calendrier']);
        } else if (role === 'USER') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          this.errorMessage = 'Rôle inconnu.';
        }
      },
      error: (err) => {
        console.error("erreur de login:",err);
        this.errorMessage = 'Email ou mot de passe incorrect, veuillez réessayer';
      }

    })

  }

}
