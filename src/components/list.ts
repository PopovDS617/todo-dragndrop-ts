import { autobind } from '../decorators/autobind.js';
import { Project, ProjectStatus } from '../models/project.js';
import { DragTarget } from '../models/drag-drop.js';
import { Component } from './component.js';
import { projectState } from '../state/state.js';
import { ProjectItem } from './item.js';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'todo' | 'done') {
    super('project-list', 'list-container', false, type);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
    this.renderProjects();
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
    }
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.add('droppable');
  }
  @autobind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'todo' ? ProjectStatus.ToDo : ProjectStatus.Done
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;

    listEl.classList.remove('droppable');
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    //очистка перед ререндером
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const filteredProjects = projects.filter((prj) => {
        if (this.type === 'todo') {
          return prj.status === ProjectStatus.ToDo;
        } else {
          return prj.status === ProjectStatus.Done;
        }
      });
      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h1')!.textContent = this.type;
  }
}
