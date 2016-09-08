import gulp from 'gulp';
import registerBundleTask from './tasks/bundle';
import registerLintTask from './tasks/lint';
import registerTestTask from './tasks/test';

registerBundleTask(gulp);
registerLintTask(gulp);
registerTestTask(gulp);
