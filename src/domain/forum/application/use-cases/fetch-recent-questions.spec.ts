import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { makeQuestion } from "test/factories/make-question";
import { FetchRecentQuestionsUseCase } from "./fetch-recent-questions";
import { beforeEach } from "vitest";
import { InMemoryQuestionsAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentRepository } from "test/repositories/in-memory-attachment-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryQuestionAttachmentsRepository: InMemoryQuestionsAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryAttachmentRepository: InMemoryAttachmentRepository;
let inMemoryStudentRepository: InMemoryStudentsRepository;
let sut: FetchRecentQuestionsUseCase;

describe("Fetch Recent Questions", () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionsAttachmentsRepository();

    inMemoryAttachmentRepository = new InMemoryAttachmentRepository();

    inMemoryStudentRepository = new InMemoryStudentsRepository();

    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentRepository,
      inMemoryStudentRepository,
    );

    sut = new FetchRecentQuestionsUseCase(inMemoryQuestionsRepository); // system under test
  });

  it("should be able to fetch recent questions", async () => {
    await inMemoryQuestionsRepository.create(
      makeQuestion({
        createdAt: new Date(2023, 0, 20),
      }),
    );

    await inMemoryQuestionsRepository.create(
      makeQuestion({
        createdAt: new Date(2023, 0, 18),
      }),
    );

    await inMemoryQuestionsRepository.create(
      makeQuestion({
        createdAt: new Date(2023, 0, 23),
      }),
    );

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.questions).toEqual([
      expect.objectContaining({
        createdAt: new Date(2023, 0, 23),
      }),
      expect.objectContaining({
        createdAt: new Date(2023, 0, 20),
      }),
      expect.objectContaining({
        createdAt: new Date(2023, 0, 18),
      }),
    ]);
  });

  it("should be able to fetch paginated recent questions", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionsRepository.create(makeQuestion());
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.questions).toHaveLength(2);
  });
});
