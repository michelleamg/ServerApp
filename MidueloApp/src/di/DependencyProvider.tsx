import React, { createContext, useContext } from 'react';
import { TestRepository } from '../Domain/repositories/TestRepository';
import { TestRepositoryImpl } from '../Data/repositories/TestRepositoryImpl';
import { RemoteTestDataSource } from '../Data/sources/remote/Test/RemoteTestDataSource';
import { GetTestQuestionsUseCase } from '../Domain/useCases/Test/GetQuestionUseCase';
import { SubmitTestUseCase } from '../Domain/useCases/Test/SubmitTestUseCase';

// Dependencies interface
interface Dependencies {
  testRepository: TestRepository;
  getTestQuestionsUseCase: GetTestQuestionsUseCase;
  submitTestUseCase: SubmitTestUseCase;
}

// Create dependencies
const testDataSource = new RemoteTestDataSource();
const testRepository = new TestRepositoryImpl(testDataSource);
const getTestQuestionsUseCase = new GetTestQuestionsUseCase(testRepository);
const submitTestUseCase = new SubmitTestUseCase(testRepository);

const dependencies: Dependencies = {
  testRepository,
  getTestQuestionsUseCase,
  submitTestUseCase
};

const DependencyContext = createContext<Dependencies>(dependencies);

export const DependencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useTestDependencies = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useTestDependencies debe ser usado dentro de DependencyProvider');
  }
  return context;
};