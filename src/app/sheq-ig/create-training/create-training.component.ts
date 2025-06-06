import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FirebaseService, Course } from '../../services/firebase.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-training',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-training.component.html',
  styleUrl: './create-training.component.scss'
})
export class CreateTrainingComponent implements OnInit {
  trainingForm: FormGroup;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | 'warning' = 'success';
  
  categories = ['safety', 'health', 'environment', 'quality', 'security'];
  difficultyLevels = ['beginner', 'intermediate', 'advanced'];
  statusOptions = ['draft', 'published', 'archived'];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.trainingForm = this.createForm();
  }

  ngOnInit(): void {}

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      estimatedDuration: ['', Validators.required],
      imageUrl: [''],
      status: ['draft', Validators.required],
      tags: this.fb.array([]),
      courseContent: this.fb.array([this.createCourseContentGroup()]),
      instructors: this.fb.array([this.createInstructorGroup()]),
      learningOutcomes: this.fb.array([this.createLearningOutcomeGroup()]),
      qualificationDetails: this.fb.array([this.createQualificationGroup()]),
      trainingRequirements: this.fb.array([this.createRequirementGroup()])
    });
  }

  // Form Array Getters
  get courseContent(): FormArray {
    return this.trainingForm.get('courseContent') as FormArray;
  }

  get instructors(): FormArray {
    return this.trainingForm.get('instructors') as FormArray;
  }

  get learningOutcomes(): FormArray {
    return this.trainingForm.get('learningOutcomes') as FormArray;
  }

  get qualificationDetails(): FormArray {
    return this.trainingForm.get('qualificationDetails') as FormArray;
  }

  get trainingRequirements(): FormArray {
    return this.trainingForm.get('trainingRequirements') as FormArray;
  }

  get tags(): FormArray {
    return this.trainingForm.get('tags') as FormArray;
  }

  // Create Form Groups
  createCourseContentGroup(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: ['', Validators.required]
    });
  }

  createInstructorGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      bio: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  createLearningOutcomeGroup(): FormGroup {
    return this.fb.group({
      outcome: ['', Validators.required]
    });
  }

  createQualificationGroup(): FormGroup {
    return this.fb.group({
      qualification: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  createRequirementGroup(): FormGroup {
    return this.fb.group({
      requirement: ['', Validators.required]
    });
  }

  // Add Methods
  addCourseContent(): void {
    this.courseContent.push(this.createCourseContentGroup());
  }

  addInstructor(): void {
    this.instructors.push(this.createInstructorGroup());
  }

  addLearningOutcome(): void {
    this.learningOutcomes.push(this.createLearningOutcomeGroup());
  }

  addQualification(): void {
    this.qualificationDetails.push(this.createQualificationGroup());
  }

  addRequirement(): void {
    this.trainingRequirements.push(this.createRequirementGroup());
  }

  addTag(): void {
    this.tags.push(this.fb.control('', Validators.required));
  }

  // Remove Methods
  removeCourseContent(index: number): void {
    if (this.courseContent.length > 1) {
      this.courseContent.removeAt(index);
    }
  }

  removeInstructor(index: number): void {
    if (this.instructors.length > 1) {
      this.instructors.removeAt(index);
    }
  }

  removeLearningOutcome(index: number): void {
    if (this.learningOutcomes.length > 1) {
      this.learningOutcomes.removeAt(index);
    }
  }

  removeQualification(index: number): void {
    if (this.qualificationDetails.length > 1) {
      this.qualificationDetails.removeAt(index);
    }
  }

  removeRequirement(index: number): void {
    if (this.trainingRequirements.length > 1) {
      this.trainingRequirements.removeAt(index);
    }
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  // Submit Method
  async onSubmit(): Promise<void> {
    if (this.trainingForm.valid) {
      this.isLoading = true;
      this.message = '';
      try {
        const formValue = this.trainingForm.value;
        
        const courseData: Partial<Course> = {
          ...formValue,
          createdBy: 'current-user-id' // Replace with actual user ID
        };

        await this.firebaseService.createCourse(courseData);
        
        this.showMessage('Training created successfully!', 'success');
        setTimeout(() => {
          this.router.navigate(['/course-management']);
        }, 2000);
      } catch (error) {
        console.error('Error creating training:', error);
        this.showMessage('Error creating training. Please try again.', 'error');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.trainingForm);
      this.showMessage('Please fill in all required fields.', 'warning');
    }
  }

  private showMessage(text: string, type: 'success' | 'error' | 'warning'): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      }
    });
  }

  // Reset Form
  onReset(): void {
    this.trainingForm.reset();
    this.trainingForm = this.createForm();
  }
}
