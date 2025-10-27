
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { careers } from "@/data/careers";
import { useCallback } from "react";

interface AcademicFieldsProps {
  career: string;
  setCareer: (career: string) => void;
  semester: string;
  setSemester: (semester: string) => void;
  loading: boolean;
}

export function AcademicFields({
  career,
  setCareer,
  semester,
  setSemester,
  loading
}: AcademicFieldsProps) {
  // Lista de semestres para el selector
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Egresado"];

  const handleCareerChange = useCallback((value: string) => {
    setCareer(value);
  }, [setCareer]);

  const handleSemesterChange = useCallback((value: string) => {
    setSemester(value);
  }, [setSemester]);

  return (
    <>
      <div>
        <label htmlFor="career" className="block text-sm font-medium mb-1">
          Carrera estudiada
        </label>
        <Select 
          value={career} 
          onValueChange={handleCareerChange}
          disabled={loading} 
          name="career"
        >
          <SelectTrigger id="career" name="career">
            <SelectValue placeholder="Selecciona tu carrera" />
          </SelectTrigger>
          <SelectContent>
            {careers.map((careerOption) => (
              <SelectItem key={careerOption} value={careerOption}>
                {careerOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="semester" className="block text-sm font-medium mb-1">
          Semestre actual
        </label>
        <Select 
          value={semester} 
          onValueChange={handleSemesterChange}
          disabled={loading} 
          name="semester"
        >
          <SelectTrigger id="semester" name="semester">
            <SelectValue placeholder="Selecciona tu semestre" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semesterOption) => (
              <SelectItem key={semesterOption} value={semesterOption}>
                {semesterOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
