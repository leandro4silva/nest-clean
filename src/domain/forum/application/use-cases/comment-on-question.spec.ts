import { beforeEach, expect, it } from "vitest";
import { InMemoryQuestionsRepository } from "test/repositories/in-memory-questions-repository";
import { CommentOnQuestionUseCase } from "./comment-on-question";
import { InMemoryQuestionsCommentsRepository } from "test/repositories/in-memory-question-comments-repository";
import { makeQuestion } from "test/factories/make-question";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryQuestionsAttachmentsRepository } from "test/repositories/in-memory-question-attachments-repository";
import { InMemoryAttachmentRepository } from "test/repositories/in-memory-attachment-repository";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryAttachmentRepository: InMemoryAttachmentRepository;
let inMemoryStudentsRepository: InMemoryStudentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionsAttachmentsRepository;
let inMemoryQuestionsCommentsRepository: InMemoryQuestionsCommentsRepository;

let sut: CommentOnQuestionUseCase;

describe("Create Comment On Question", () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionsAttachmentsRepository();

    inMemoryStudentsRepository = new InMemoryStudentsRepository();

    inMemoryAttachmentRepository = new InMemoryAttachmentRepository();

    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachmentRepository,
      inMemoryStudentsRepository,
    );

    inMemoryQuestionsCommentsRepository =
      new InMemoryQuestionsCommentsRepository(inMemoryStudentsRepository);

    sut = new CommentOnQuestionUseCase(
      inMemoryQuestionsRepository,
      inMemoryQuestionsCommentsRepository,
    ); // system under test
  });

  it("should be able to comment on question", async () => {
    const newQuestion = makeQuestion();

    await inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      authorId: newQuestion.authorId.toString(),
      questionId: newQuestion.id.toString(),
      content: "Conteudo do comentario",
    });

    if (result.isRight()) {
      expect(inMemoryQuestionsCommentsRepository.items[0]).toEqual(
        result.value.questionComment,
      );
    }
  });

  it("should be not able to comment on question", async () => {
    const newQuestion = makeQuestion();

    await inMemoryQuestionsRepository.create(newQuestion);

    const result = await sut.execute({
      authorId: newQuestion.authorId.toString(),
      questionId: "question-2",
      content: "Conteudo do comentario",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
