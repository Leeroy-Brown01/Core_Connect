import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-training-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Workplace Code of Conduct -->
      <section>
        <h3 class="text-lg font-medium text-gray-900">Workplace Code of Conduct</h3>
        <div class="mt-4 space-y-4">
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Employee Rights and Responsibilities</h4>
            <p class="mt-2 text-sm text-gray-600">Learn about workplace ethics, policies, and professional conduct standards.</p>
          </article>
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Professional Behavior and Ethics</h4>
            <p class="mt-2 text-sm text-gray-600">Understanding professional conduct and ethical considerations in the workplace.</p>
          </article>
        </div>
      </section>

      <!-- Health and Safety -->
      <section>
        <h3 class="text-lg font-medium text-gray-900">Health and Safety</h3>
        <div class="mt-4 space-y-4">
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Employee Safety Guidelines</h4>
            <p class="mt-2 text-sm text-gray-600">Essential safety protocols and procedures for cleaning staff.</p>
          </article>
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">First Aid Basics</h4>
            <p class="mt-2 text-sm text-gray-600">Basic first aid procedures and emergency response guidelines.</p>
          </article>
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Storage Handling</h4>
            <p class="mt-2 text-sm text-gray-600">Proper storage and handling of cleaning materials and equipment.</p>
          </article>
        </div>
      </section>

      <!-- Standard Operating Procedures -->
      <section>
        <h3 class="text-lg font-medium text-gray-900">Standard Operating Procedures</h3>
        <div class="mt-4 space-y-4">
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Daily Cleaning Protocols</h4>
            <p class="mt-2 text-sm text-gray-600">Step-by-step procedures for daily cleaning tasks and routines.</p>
          </article>
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Waste Disposal Guidelines</h4>
            <p class="mt-2 text-sm text-gray-600">Proper methods for waste segregation and disposal.</p>
          </article>
        </div>
      </section>

      <!-- Customer Service & Environment -->
      <section>
        <h3 class="text-lg font-medium text-gray-900">Customer Service & Environment</h3>
        <div class="mt-4 space-y-4">
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Customer Interaction Best Practices</h4>
            <p class="mt-2 text-sm text-gray-600">Guidelines for professional interaction with clients and customers.</p>
          </article>
          <article class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-base font-medium text-gray-800">Environmental Awareness</h4>
            <p class="mt-2 text-sm text-gray-600">Understanding environmental impact and sustainable cleaning practices.</p>
          </article>
        </div>
      </section>
    </div>
  `,

})
export class TrainingContentComponent {
  constructor() {}
}
