import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'playerOnField'})
export class PlayerOnFieldFilterPipe implements PipeTransform {
  transform(value: any[], shouldBeOnField: boolean): any[] {
    return value.filter(v => shouldBeOnField ? v.onField : !v.onField);
  }
}
