import { CheckCircle } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : isCurrent 
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span 
                className={`
                  text-xs text-center max-w-20 leading-tight
                  ${isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}
                `}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center">
        {Array.from({ length: totalSteps - 1 }).map((_, index) => {
          const isCompleted = index + 1 < currentStep;
          
          return (
            <div key={index} className="flex items-center flex-1">
              <div 
                className={`
                  h-2 flex-1 rounded-full transition-all duration-500
                  ${isCompleted ? 'bg-primary' : 'bg-muted'}
                `}
              />
              {index < totalSteps - 2 && <div className="w-10" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};