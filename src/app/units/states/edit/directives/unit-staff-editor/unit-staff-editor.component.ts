import {Component, Input, OnInit} from '@angular/core';
// importing necessary services
import {AlertService} from 'src/app/common/services/alert.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {UnitRoleService} from 'src/app/api/services/unit-role.service';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'unit-staff-editor', // Define the component selector
  templateUrl: './unit-staff-editor.component.html', // Link to the HTML template
  // styleUrls: ['./unit-staff-editor.component.scss'], // Link to the SCSS file for styles
})
export class UnitStaffEditorComponent implements OnInit {
  @Input() unit: any; // Input property to receive data from the parent component
  unitStaff: any[] = []; // Array to hold the staff members
  selectedStaff: any; // This is the staff member selected by the user to be added
  staff: any;
  $viewValue: any;

  // Injecting services into the component through the constructor
  constructor(
    private alertService: AlertService,
    private unitService: UnitService,
    private newUnitRoleService: UnitRoleService,
  ) {}

  // Lifecycle hook that runs when the component is initialized
  ngOnInit(): void {
    // Subscribe to the unit's staff cache to keep the unitStaff array updated
    this.unitStaff = this.unit.staffCache.values;
  }

  // Method to change the role of a staff member (e.g., Tutor or Convenor)
  changeRole(unitRole: any, roleId: number): void {
    unitRole.roleId = roleId; // Update the roleId property of the unit role
    this.newUnitRoleService.update(unitRole).subscribe({
      // On successful update, show a success alert
      next: () => this.alertService.success('Role changed', 2000),
      // On error, show an error alert
      error: (response) => this.alertService.error(response, 6000),
    });
  }

  // Method to change the main convenor of the unit
  changeMainConvenor(staff: any): void {
    this.unit.changeMainConvenor(staff).subscribe({
      // On successful change, show a success alert
      next: () => this.alertService.success('Main convenor changed', 2000),
      // On error, show an error alert
      error: (response) => this.alertService.error(response, 6000),
    });
  }

  // Method to add a selected staff member to the unit
  addSelectedStaff(): void {
    const staff = this.selectedStaff; // Get the selected staff member
    this.selectedStaff = null; // Clear the selected staff input
    this.unit.staff = []; // Ensure the unit staff array is initialized

    if (staff.id) {
      // If the selected staff member has an ID, add them to the unit
      this.unit.addStaff(staff).subscribe({
        next: () => this.alertService.success('Staff member added', 2000), // Show success alert
        error: (response) => this.alertService.error(response, 6000), // Show error alert
      });
    } else {
      // If no ID, show an error message indicating they can't be added
      this.alertService.error(
        'Unable to add staff member. Ensure they have a tutor or convenor account in User admin first.',
        6000,
      );
    }
  }

  // Method to filter staff members already assigned to the unit
  filterStaff(staff: any): boolean {
    // Return true if the staff member is not already in the unit's staff list
    return !this.unit.staff.find((listStaff: any) => staff.id === listStaff.user.id);
  }

  // Method to remove a staff member from the unit
  removeStaff(staff: any): void {
    this.newUnitRoleService.delete(staff, {cache: this.unit.staffCache}).subscribe({
      next: () => this.alertService.success('Staff member removed', 2000), // Show success alert
      error: (response) => this.alertService.error(response, 6000), // Show error alert
    });
  }

  // Method to get the name of a group set based on its ID
  groupSetName(id: number): string {
    return this.unit.groupSetsCache.get(id)?.name || 'Individual Work'; // Return the group set name or "Individual Work" if not found
  }
}
