# AGENT.md - Guide for AI Coding Agents 🤖

**Version:** 1.0.0  
**Last Updated:** 2026-02-05  
**Purpose:** This file contains ALL the rules, best practices, and guidelines for AI agents working on this NestJS codebase.

---

## 📚 Before You Start

**Read these files in order:**

1. **README.md** - Project overview, setup, and quick start
2. **FILE_TREE.md** - Complete project structure (auto-generated)
3. **CODEBASE.md** - All exported functions/classes with JSDoc (auto-generated)

These files are updated automatically on every commit.

---

## 🎯 Core Philosophy

**Your Mission:** Write clean, maintainable, bug-free NestJS code that passes all automated checks.

**Golden Rules:**

1. ✅ **Search before creating** - Always check if service/controller/module exists
2. ✅ **DRY principle** - Extract common patterns, avoid duplication
3. ✅ **Zero tolerance for `: any`** - Use specific types or `unknown`
4. ✅ **TDD workflow** - Write tests FIRST (RED → GREEN → REFACTOR)
5. ✅ **Files under 500 lines** - Split larger files into modules
6. ✅ **Fix ALL warnings** - ESLint, TypeScript, SonarQube before commit
7. ✅ **Commits follow convention** - `type(scope): description`

---

## 🛡️ Automated Guardrails (What Will Block You)

### Pre-Commit Hooks (~10s)

These run BEFORE your commit is accepted:

```
❌ BLOCKS if ESLint errors found
❌ BLOCKS if Prettier formatting issues
❌ BLOCKS if TypeScript type errors
❌ BLOCKS if `: any` detected in code
❌ BLOCKS if any file > 500 lines
❌ BLOCKS if tests fail for modified files
```

### Commit Message Hook

```
❌ BLOCKS if commit message doesn't follow format
✅ Required format: type(scope): description

Examples:
✅ feat: add user authentication
✅ fix(api): resolve timeout issue
✅ docs: update README
❌ Add feature (no type)
❌ FEAT: add feature (uppercase type)
```

### Pre-Push Hooks (~60s)

These run BEFORE your push is accepted:

```
❌ BLOCKS if TypeScript build fails
❌ BLOCKS if any test fails
❌ BLOCKS if coverage < 80%
```

---

## 🏗️ NestJS Architecture Patterns

### 1. Module Organization

**Structure modules by feature:**

```
src/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.service.spec.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts
├── auth/
├── posts/
└── app.module.ts
```

### 2. Dependency Injection

✅ **Always use constructor injection:**

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: Logger,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
}
```

❌ **Avoid property injection:**

```typescript
@Injectable()
export class UsersService {
  @Inject(UsersRepository)
  private usersRepository: UsersRepository; // ❌ Don't do this
}
```

### 3. DTOs (Data Transfer Objects)

**Always validate input with class-validator:**

```typescript
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

**Enable validation globally in `main.ts`:**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip properties not in DTO
    forbidNonWhitelisted: true, // Throw error if extra properties
    transform: true, // Auto-transform to DTO class instances
  }),
);
```

### 4. Controllers - Keep Them Thin

✅ **Controllers should only:**
- Route requests
- Validate input (via DTOs)
- Call service methods
- Return responses

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }
}
```

❌ **Don't put business logic in controllers:**

```typescript
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    // ❌ This belongs in a service!
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.repository.create({ ...dto, password: hashedPassword });
    return this.repository.save(user);
  }
}
```

### 5. Services - Business Logic Layer

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Create a new user with hashed password
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(createUserDto.password);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Find user by email
   * @throws NotFoundException if user not found
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }
}
```

### 6. Exception Handling

✅ **Use NestJS built-in exceptions:**

```typescript
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class UsersService {
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ 
      where: { email: dto.email } 
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    return this.usersRepository.save(dto);
  }
}
```

### 7. Async/Await Best Practices

✅ **Always use async/await (never raw Promises):**

```typescript
async findAll(): Promise<User[]> {
  return await this.usersRepository.find();
}
```

✅ **Handle errors with try/catch when needed:**

```typescript
async sendEmail(to: string, subject: string): Promise<void> {
  try {
    await this.emailService.send({ to, subject });
  } catch (error) {
    this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw new InternalServerErrorException('Failed to send email');
  }
}
```

❌ **Don't mix Promise chains with async/await:**

```typescript
// ❌ Bad - mixing styles
async getData(): Promise<Data> {
  return this.service.fetch()
    .then(data => this.transform(data))
    .catch(err => { throw new Error(err); });
}

// ✅ Good - consistent async/await
async getData(): Promise<Data> {
  const data = await this.service.fetch();
  return this.transform(data);
}
```

---

## 🧪 Testing (TDD Workflow)

### Test Structure

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: MockType<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const dto: CreateUserDto = {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      const expectedUser = { id: 1, ...dto, password: 'hashed' };
      repository.save.mockResolvedValue(expectedUser);

      const result = await service.create(dto);

      expect(result).toEqual(expectedUser);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
```

### TDD Workflow

**RED → GREEN → REFACTOR:**

1. **Write failing test** (RED)
2. **Write minimal code to pass** (GREEN)
3. **Refactor while keeping tests green** (REFACTOR)

```typescript
// 1. RED - Write test first
it('should calculate total price with discount', () => {
  const result = calculateTotal(100, 0.1);
  expect(result).toBe(90);
});

// 2. GREEN - Minimal implementation
function calculateTotal(price: number, discount: number): number {
  return price - (price * discount);
}

// 3. REFACTOR - Improve without breaking test
function calculateTotal(price: number, discount: number): number {
  if (discount < 0 || discount > 1) {
    throw new Error('Discount must be between 0 and 1');
  }
  return price * (1 - discount);
}
```

---

## 📏 Code Quality Rules

### TypeScript Strict Mode

```typescript
// ✅ Explicit return types
function getUser(id: number): Promise<User> {
  return this.usersService.findOne(id);
}

// ❌ No return type
function getUser(id: number) { // TypeScript infers return type
  return this.usersService.findOne(id);
}

// ✅ No `: any`
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data);
}

// ❌ Using `: any`
function processData(data: any): string { // ❌ BLOCKS commit
  return data.toString();
}
```

### File Size Limit

**Max 500 lines per file** (enforced by ESLint)

```
✅ users.service.ts (245 lines)
✅ auth.service.ts (380 lines)
❌ api.service.ts (612 lines) ← SPLIT THIS!
```

**How to split:**

```typescript
// Before (600+ lines)
@Injectable()
export class ApiService {
  // 50 methods...
}

// After (split by responsibility)
@Injectable()
export class UserApiService { /* user-related methods */ }

@Injectable()
export class PostApiService { /* post-related methods */ }

@Injectable()
export class CommentApiService { /* comment-related methods */ }
```

### Complexity Limits

**Max cognitive complexity: 15** (enforced by SonarJS)

❌ **Too complex (>15):**

```typescript
function processOrder(order: Order): void {
  if (order.items.length > 0) {
    for (const item of order.items) {
      if (item.quantity > 0) {
        if (item.inStock) {
          if (order.isPremium) {
            if (item.discount > 0) {
              // ... nested logic
            }
          }
        }
      }
    }
  }
}
```

✅ **Refactored (complexity < 15):**

```typescript
function processOrder(order: Order): void {
  const validItems = this.getValidItems(order);
  validItems.forEach(item => this.processItem(item, order.isPremium));
}

private getValidItems(order: Order): Item[] {
  return order.items.filter(item => 
    item.quantity > 0 && item.inStock
  );
}

private processItem(item: Item, isPremium: boolean): void {
  const finalPrice = this.calculatePrice(item, isPremium);
  this.addToCart(item, finalPrice);
}
```

---

## 🔄 Git Workflow

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI configuration
- `chore`: Maintenance tasks

**Examples:**

```bash
✅ feat(users): add email verification
✅ fix(auth): resolve token expiration bug
✅ docs: update API documentation
✅ refactor(users): extract validation logic
✅ test(auth): add login flow tests
```

### Before You Commit

```bash
# 1. Check your changes
git status
git diff

# 2. Stage files
git add .

# 3. Commit (hooks run automatically)
git commit -m "feat: add user authentication"

# Pre-commit runs (~10s):
#   ✓ ESLint --fix
#   ✓ Prettier --write
#   ✓ Type check
#   ✓ Generate docs (FILE_TREE.md, CODEBASE.md)

# 4. Push (pre-push hooks run ~60s)
git push

# Pre-push runs:
#   ✓ Build TypeScript
#   ✓ All tests
#   ✓ Coverage check (≥80%)
```

---

## 📊 Coverage Requirements

**Minimum 80% coverage on:**
- Lines
- Statements
- Functions
- Branches

```bash
# Check coverage
npm run test:cov

# Output:
# ✅ lines      : 85.2% (min: 80%)
# ✅ statements : 84.8% (min: 80%)
# ✅ functions  : 82.1% (min: 80%)
# ✅ branches   : 80.5% (min: 80%)
```

**If coverage < 80%:**
```
❌ Validation failed: Coverage below 80%
💡 Write more tests to increase coverage.
```

---

## 🚀 Development Commands

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debugger

# Testing
npm test                   # Run tests in watch mode
npm run test:ci            # Run all tests once
npm run test:cov           # Run with coverage
npm run test:e2e           # Run E2E tests

# Linting & Formatting
npm run lint               # Check for errors
npm run lint:fix           # Auto-fix errors
npm run format             # Format with Prettier

# Type Checking
npm run type-check         # Check types
npm run type-check:watch   # Check types in watch mode

# Documentation
npm run tree               # Generate FILE_TREE.md
npm run map                # Generate CODEBASE.md
npm run docs               # Generate both

# Validation (pre-push equivalent)
npm run validate           # lint + type-check + test
npm run validate:full      # validate + coverage check
```

---

## ✅ Checklist Before Committing

- [ ] Code follows NestJS best practices
- [ ] All files < 500 lines
- [ ] No `: any` in code
- [ ] Tests written (TDD)
- [ ] Tests passing (`npm test`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Types check (`npm run type-check`)
- [ ] Commit message follows convention
- [ ] Coverage ≥ 80%

---

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [SonarJS Rules](https://github.com/SonarSource/eslint-plugin-sonarjs)

---

**Remember:** All these rules are enforced automatically. If something blocks you, it's protecting code quality.
